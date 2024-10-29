from decimal import Decimal
from django.core.exceptions import PermissionDenied
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, SerializerMethodField, ValidationError

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_comment import CreditTransferComment
from api.models.credit_transfer_content import CreditTransferContent
from api.models.credit_transfer_history import CreditTransferHistory
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.models.credit_class import CreditClass
from api.models.model_year import ModelYear
from api.models.weight_class import WeightClass
from api.models.signing_authority_confirmation import \
    SigningAuthorityConfirmation
from api.models.user_profile import UserProfile
from api.serializers.credit_transfer_comment import \
    CreditTransferCommentSerializer
from api.serializers.credit_transfer_content import \
    CreditTransferContentSerializer, CreditTransferContentSaveSerializer
from api.serializers.user import UserBasicSerializer
from api.serializers.organization import OrganizationNameSerializer, OrganizationSerializer
from api.services.credit_transaction import calculate_insufficient_credits
from api.services.send_email import notifications_credit_transfers
from ..mixins.user_mixin import UserMixin

class CreditTransferBaseSerializer(UserMixin):
    def get_history(self, obj):
        request = self.context.get('request')
        if request.user.is_government:
            history = CreditTransferHistory.objects.filter(
                transfer_id=obj.id)
        else:
            create_user_subquery = UserProfile.objects.filter(organization__is_government=True).values_list('username', flat=True)
            
            history = CreditTransferHistory.objects.filter(
                transfer_id=obj.id,
                status__in=[
                    CreditTransferStatuses.DRAFT,
                    CreditTransferStatuses.SUBMITTED,
                    CreditTransferStatuses.APPROVED,
                    CreditTransferStatuses.DISAPPROVED,
                    CreditTransferStatuses.RESCINDED,
                    CreditTransferStatuses.RESCIND_PRE_APPROVAL,
                    CreditTransferStatuses.REJECTED,
                    CreditTransferStatuses.VALIDATED
                ]).exclude(create_user__in=create_user_subquery, status__in=[CreditTransferStatuses.APPROVED, CreditTransferStatuses.DISAPPROVED,])
        serializer = CreditTransferHistorySerializer(history, many=True, read_only=True, context={'request': request})
        return serializer.data


class CreditTransferHistorySerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        CreditTransferBaseSerializer
):
    create_user = SerializerMethodField()
    update_user = SerializerMethodField()
    status = EnumField(CreditTransferStatuses)
    comment = SerializerMethodField()

    def get_comment(self, obj):
        request = self.context.get('request')
        credit_transfer_comment = CreditTransferComment.objects.filter(
            credit_transfer_history=obj
        ).first()

        if credit_transfer_comment:
            serializer = CreditTransferCommentSerializer(
                credit_transfer_comment, read_only=True, many=False, context={'request': request}
            )
            return serializer.data
        return None

    class Meta:
        model = CreditTransferHistory
        fields = (
            'create_timestamp', 'create_user',
            'status', 'update_user', 'comment'
            )


class CreditTransferListSerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        CreditTransferBaseSerializer
):
    history = SerializerMethodField()
    credit_to = OrganizationNameSerializer()
    credit_transfer_content = CreditTransferContentSerializer(
        many=True, read_only=True
    )
    debit_from = OrganizationNameSerializer()
    status = SerializerMethodField()
    update_user = SerializerMethodField()

    def get_status(self, obj):
        request = self.context.get('request')
        if not request.user.is_government and obj.status in [
                CreditTransferStatuses.RECOMMEND_REJECTION,
                CreditTransferStatuses.RECOMMEND_APPROVAL
        ]:
            return CreditTransferStatuses.APPROVED.value
        return obj.get_status_display()

    class Meta:
        model = CreditTransfer
        fields = (
            'create_timestamp', 'credit_to', 'credit_transfer_content',
            'debit_from', 'id', 'status', 'update_user', 'update_timestamp',
            'history',
        )


class CreditTransferSerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        CreditTransferBaseSerializer
):
    history = SerializerMethodField()
    credit_to = OrganizationNameSerializer()
    credit_transfer_content = CreditTransferContentSerializer(
        many=True, read_only=True
    )
    debit_from = OrganizationNameSerializer()
    status = SerializerMethodField()
    update_user = SerializerMethodField()
    sufficient_credits = SerializerMethodField()
    pending = SerializerMethodField()

    def get_pending(self, obj):
        request = self.context.get('request')
        if request.user.is_government:
            pending_transfers = CreditTransfer.objects.filter(
                debit_from=obj.debit_from.id,
                status__in=[
                    CreditTransferStatuses.SUBMITTED,
                    CreditTransferStatuses.APPROVED,
                    CreditTransferStatuses.RECOMMEND_APPROVAL,
                    CreditTransferStatuses.RECOMMEND_REJECTION,
                ])
            return pending_transfers.count()
        return ''

    def get_sufficient_credits(self, _obj):
        has_credits = True
        request = self.context.get('request')
        if request.user.is_government:
            supplier_balance = calculate_insufficient_credits(
                self.instance.debit_from, self.instance)
            content = CreditTransferContent.objects.filter(
                credit_transfer_id=self.instance.id
            )
            for each in content:
                request_year = each.model_year.id
                request_credit_class = each.credit_class.id
                request_weight = each.weight_class.id
                request_credit_value = each.credit_value

                for record in supplier_balance:
                    if request_weight == record['weight_class_id']:
                        if request_year == record['model_year_id']:
                            if request_credit_class == record['credit_class_id']:
                                record['total_value'] = Decimal(record['total_value']) - request_credit_value
            
            for record in supplier_balance:
                if record['total_value'] < 0:
                    has_credits = False
                    break

        return has_credits

    def get_status(self, obj):
        request = self.context.get('request')
        if not request.user.is_government and obj.status in [
                CreditTransferStatuses.RECOMMEND_REJECTION,
                CreditTransferStatuses.RECOMMEND_APPROVAL
        ]:
            return CreditTransferStatuses.APPROVED.value
        return obj.get_status_display()

    class Meta:
        model = CreditTransfer
        fields = (
            'create_timestamp', 'credit_to', 'credit_transfer_content',
            'debit_from', 'id', 'status', 'update_user',
            'history', 'sufficient_credits', 'pending'
        )


class CreditTransferOrganizationBalancesSerializer(ModelSerializer):
    credit_to = OrganizationSerializer()
    debit_from = OrganizationSerializer()

    class Meta:
        model = CreditTransfer
        fields = ('credit_to', 'debit_from')


class CreditTransferSaveSerializer(ModelSerializer):
    """
    Serializer to create a transfer
    """
    status = EnumField(CreditTransferStatuses)
    content = CreditTransferContentSaveSerializer(allow_null=True, many=True)

    def validate_status(self, value):
        request = self.context.get('request')
        content = request.data.get('content')
        model_years = ModelYear.objects.all()
        credit_classes = CreditClass.objects.all()
        weights = WeightClass.objects.all()

        if not request.user.has_perm('SUBMIT_CREDIT_TRANSFER_PROPOSAL') and \
                value == CreditTransferStatuses.SUBMITTED:
            raise PermissionDenied(
                "You do not have the permission to sign this credit transfer."
            )
        # check to make sure its a draft
        if value in [CreditTransferStatuses.DRAFT, CreditTransferStatuses.SUBMITTED]:
            supplier_totals = calculate_insufficient_credits(content[0]['debit_from'])
            has_enough = True
            # loop through request and check against supplier balance
            for each in content:
                found = False
                # aggregate by unique combinations of credit year/type
                credit_value = each['credit_value']
                model_year = model_years.filter(name=each['model_year']).first().id
                credit_type = credit_classes.filter(credit_class=each['credit_class']).first().id
                weight_type = weights.filter(weight_class_code=each['weight_class']).first().id
                # check if supplier has enough for this transfer
                for record in supplier_totals:
                    if (record['model_year_id'] == model_year and record['credit_class_id'] == credit_type
                            and record['weight_class_id'] == weight_type):
                        found = True
                        record['total_value'] -= float(credit_value)
                        if record['total_value'] < 0:
                            has_enough = False
                if not found:
                    has_enough = False
                if not has_enough:
                    raise ValidationError('Supplier has insufficient credits to fulfil this transfer.')
        return value

    def validate_validation_status(self, value):
        request = self.context.get('request')
        instance = self.instance
        instance.validate_validation_status(value, request)

        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        content = request.data.get('content')
        signing_confirmation = request.data.get('signing_confirmation', None)
        credit_transfer_comment = request.data.get('credit_transfer_comment')
        old_status = instance.status
        if content:
            CreditTransferContent.objects.filter(credit_transfer_id=instance.id).delete()
            serializer = CreditTransferContentSaveSerializer(
                data=content, many=True, context={
                    'credit_transfer': instance
                }
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
        credit_to = validated_data.get('credit_to')
        if credit_to:
            instance.credit_to = credit_to
            instance.update_user = request.user.username
            instance.save()

        validation_status = validated_data.get('status')
        if validation_status:
            if (instance.status == CreditTransferStatuses.SUBMITTED) & (validation_status == CreditTransferStatuses.RESCINDED):
                validation_status = CreditTransferStatuses.RESCIND_PRE_APPROVAL
            credit_history = CreditTransferHistory.objects.create(
                transfer=instance,
                status=validation_status,
                update_user=request.user.username,
                create_user=request.user.username,
            )
            if credit_transfer_comment:
                CreditTransferComment.objects.create(
                    create_user=request.user.username,
                    credit_transfer_history=credit_history,
                    comment=credit_transfer_comment.get('comment')
                )
            instance.status = validation_status
            instance.update_user = request.user.username
            instance.save()
            credit_history.save()

        if signing_confirmation and validation_status in [
                CreditTransferStatuses.APPROVED,
                CreditTransferStatuses.SUBMITTED
        ]:
            for confirmation in signing_confirmation:
                SigningAuthorityConfirmation.objects.create(
                    create_user=request.user.username,
                    credit_transfer=instance,
                    has_accepted=True,
                    title=request.user.title,
                    signing_authority_assertion_id=confirmation
                )

        instance.old_status = old_status
        return instance

    def create(self, validated_data):
        request = self.context.get('request')
        content = request.data.get('content')
        signing_confirmation = request.data.get('signing_confirmation', None)
        validation_status = validated_data.get('status')

        credit_transfer = CreditTransfer.objects.create(
            credit_to=validated_data.get('credit_to'),
            debit_from=validated_data.get('debit_from'),
            status=validation_status,
            create_user=request.user.username,
            update_user=request.user.username
        )
        credit_history = CreditTransferHistory.objects.create(
            transfer=credit_transfer,
            status=validation_status,
            update_user=request.user.username,
            create_user=request.user.username,
        )

        if content:
            serializer = CreditTransferContentSaveSerializer(
                data=content, many=True, context={
                    'credit_transfer': credit_transfer
                }
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            credit_history.save()

        if signing_confirmation and \
                validation_status == CreditTransferStatuses.SUBMITTED:
            for confirmation in signing_confirmation:
                SigningAuthorityConfirmation.objects.create(
                    create_user=request.user.username,
                    credit_transfer=credit_transfer,
                    has_accepted=True,
                    title=request.user.title,
                    signing_authority_assertion_id=confirmation
                )

            notifications_credit_transfers(credit_transfer, False, False)

        serializer = CreditTransferSerializer(
            credit_transfer, read_only=True,
            context={
                'request': request
            }
        )

        return serializer.data

    class Meta:
        model = CreditTransfer
        fields = (
            'id', 'status', 'credit_to', 'debit_from', 'content',
        )

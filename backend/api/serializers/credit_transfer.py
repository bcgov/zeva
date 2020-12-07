import logging
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_comment import CreditTransferComment
from api.models.credit_transfer_content import CreditTransferContent
from api.models.credit_transfer_history import CreditTransferHistory
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.models.signing_authority_confirmation import \
    SigningAuthorityConfirmation
from api.models.user_profile import UserProfile
from api.serializers.credit_transfer_comment import \
    CreditTransferCommentSerializer
from api.serializers.credit_transfer_content import \
    CreditTransferContentSerializer, CreditTransferContentSaveSerializer
from api.serializers.user import MemberSerializer, UserSerializer
from api.serializers.organization import OrganizationSerializer
from api.models.user_role import UserRole
from api.models.role import Role
from api.models.organization import Organization
from rest_framework.response import Response
from api.services.send_email import send_email

LOGGER = logging.getLogger(__name__)


class CreditTransferBaseSerializer:
    def get_update_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.update_user

    def get_create_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.create_user)
        if user_profile.exists():
            serializer = UserSerializer(user_profile.first(), read_only=True)
            return serializer.data
        return obj.create_user


class CreditTransferHistorySerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        CreditTransferBaseSerializer
):
    create_user = SerializerMethodField()
    update_user = SerializerMethodField()
    status = EnumField(CreditTransferStatuses)

    class Meta:
        model = CreditTransferHistory
        fields = (
            'create_timestamp', 'create_user',
            'status', 'update_user'
            )


class CreditTransferSerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        CreditTransferBaseSerializer
):
    history = CreditTransferHistorySerializer(read_only=True, many=True)
    credit_to = OrganizationSerializer()
    credit_transfer_content = CreditTransferContentSerializer(
        many=True, read_only=True
    )
    debit_from = OrganizationSerializer()
    status = SerializerMethodField()
    update_user = SerializerMethodField()
    credit_transfer_comment = SerializerMethodField()

    def get_status(self, obj):
        request = self.context.get('request')
        if not request.user.is_government and obj.status in [
            CreditTransferStatuses.RECOMMEND_REJECTION,
            CreditTransferStatuses.RECOMMEND_APPROVAL
        ]:
            return CreditTransferStatuses.APPROVED.value
        return obj.get_status_display()

    def get_credit_transfer_comment(self, obj):
        credit_transfer_comment = CreditTransferComment.objects.filter(
            credit_transfer=obj
        ).order_by('-create_timestamp')

        if credit_transfer_comment.exists():
            serializer = CreditTransferCommentSerializer(
                credit_transfer_comment, read_only=True, many=True
            )
            return serializer.data

        return None

    class Meta:
        model = CreditTransfer
        fields = (
            'create_timestamp', 'credit_to', 'credit_transfer_content',
            'debit_from', 'id', 'status', 'update_user',
            'credit_transfer_comment', 'history',
        )


class CreditTransferSaveSerializer(ModelSerializer):
    """
    Serializer to create a transfer
    """
    status = EnumField(CreditTransferStatuses)
    content = CreditTransferContentSaveSerializer(allow_null=True, many=True)
    credit_transfer_comment = CreditTransferCommentSerializer(
        allow_null=True,
        required=False
    )

    def validate_validation_status(self, value):
        request = self.context.get('request')
        instance = self.instance

        instance.validate_validation_status(value, request)

        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        content = request.data.get('content')
        signing_confirmation = request.data.get('signing_confirmation', None)
        credit_transfer_comment = validated_data.pop('credit_transfer_comment', None)

        if credit_transfer_comment:
            CreditTransferComment.objects.create(
                create_user=request.user.username,
                credit_transfer=instance,
                comment=credit_transfer_comment.get('comment')
            )
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
            CreditTransferHistory.objects.create(
                transfer=instance,
                status=validation_status,
                update_user=request.user.username,
                create_user=request.user.username,
            )
            instance.status = validation_status
            instance.update_user = request.user.username
            instance.save()

            """
            Send email to the IDIR users if status is one of the following
            """

            gov = Organization.objects.get(is_government='True').id
            email = None
            if validation_status in [
                    CreditTransferStatuses.RECOMMEND_APPROVAL,
                    CreditTransferStatuses.RECOMMEND_REJECTION
            ]:
                
                director = Role.objects.get(role_code='Director').id
                user_dir = UserRole.objects.filter(role_id=director).values_list('user_profile',flat=True)
                email = UserProfile.objects.values_list('email', flat=True).filter(id__in=user_dir,organization_id=gov).exclude(email__isnull=True)
    
            elif validation_status is CreditTransferStatuses.APPROVED:
                analyst = Role.objects.get(role_code='Engineer/Analyst').id
                user_analyst = UserRole.objects.filter(role_id=analyst).values_list('user_profile',flat=True)
                email = UserProfile.objects.values_list('email', flat=True).filter(id__in=user_analyst,organization_id=gov).exclude(email__isnull=True)

            elif validation_status is CreditTransferStatuses.SUBMITTED and credit_to:
                email = UserProfile.objects.values_list('email', flat=True).filter(organization_id=credit_to).exclude(email__isnull=True)

            if email:
                try:
                    send_email(list(email))
                except Exception as e:
                    LOGGER.error('Email Failed! %s', e)


        if signing_confirmation and validation_status in [
                CreditTransferStatuses.APPROVED,
                CreditTransferStatuses.SUBMITTED
        ]:
            for confirmation in signing_confirmation:
                SigningAuthorityConfirmation.objects.create(
                    credit_transfer=instance,
                    has_accepted=True,
                    title=request.user.title,
                    signing_authority_assertion_id=confirmation
                )

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
                    credit_transfer=credit_transfer,
                    has_accepted=True,
                    title=request.user.title,
                    signing_authority_assertion_id=confirmation
                )

            credit_to = validated_data.get('credit_to')
            if credit_to:
                email = UserProfile.objects.values_list('email', flat=True).filter(organization=credit_to).exclude(email__isnull=True)
                if email:
                    try:
                        send_email(list(email))
                    except Exception as e:
                        LOGGER.error('Email Failed! %s', e)

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
            'credit_transfer_comment'
        )

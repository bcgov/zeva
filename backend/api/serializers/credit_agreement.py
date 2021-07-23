from rest_framework.serializers import ModelSerializer, SerializerMethodField
from enumfields.drf import EnumField, EnumSupportSerializerMixin

from api.models.credit_agreement import CreditAgreement
from api.models.credit_agreement_attachment import CreditAgreementAttachment
from api.models.credit_agreement_comment import CreditAgreementComment
from api.models.credit_agreement_content import CreditAgreementContent
from api.models.credit_agreement_statuses import CreditAgreementStatuses
from api.models.credit_agreement_transaction_types import CreditAgreementTransactionTypes
from api.models.credit_class import CreditClass
from api.models.model_year import ModelYear
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer
from api.serializers.credit_agreement_attachment import CreditAgreementAttachmentSerializer
from api.serializers.credit_agreement_comment import CreditAgreementCommentSerializer
from api.serializers.credit_agreement_content import \
    CreditAgreementContentSerializer
from .organization import OrganizationSerializer
from api.models.credit_agreement_history import CreditAgreementHistory

class CreditAgreementBaseSerializer:
    def get_update_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.update_user


class CreditAgreementSerializer(ModelSerializer, CreditAgreementBaseSerializer):
    organization = OrganizationSerializer(read_only=True)
    transaction_type = EnumField(CreditAgreementTransactionTypes)
    credit_agreement_content = CreditAgreementContentSerializer(
        many=True, read_only=True
    )
    status = EnumField(CreditAgreementStatuses)
    comments = SerializerMethodField()
    attachments = SerializerMethodField()

    def get_comments(self, obj):
        agreement_comment = CreditAgreementComment.objects.filter(
            credit_agreement=obj
        ).order_by('-create_timestamp')

        if agreement_comment.exists():
            serializer = CreditAgreementCommentSerializer(
                agreement_comment, read_only=True, many=True
            )
            return serializer.data

        return None

    def get_attachments(self, instance):
        attachments = CreditAgreementAttachment.objects.filter(
            credit_agreement_id=instance.id,
            is_removed=False)

        serializer = CreditAgreementAttachmentSerializer(attachments, many=True)

        return serializer.data

    class Meta:
        model = CreditAgreement
        fields = (
            'id', 'organization', 'effective_date', 'status',
            'transaction_type', 'comments', 'optional_agreement_id', 
            'update_timestamp', 'attachments','credit_agreement_content'
        )


class CreditAgreementTransactionTypeSerializer(ModelSerializer):
    class Meta:
        model = CreditAgreementTransactionTypes
        fields = (
            'transaction_type',
        )


class CreditAgreementSaveSerializer(ModelSerializer, EnumSupportSerializerMixin):
    status = EnumField(
        CreditAgreementStatuses,
        required=False
    )
    transaction_type = EnumField(
        CreditAgreementTransactionTypes,
        required=False
    )
    agreement_attachments = CreditAgreementAttachmentSerializer(
        allow_null=True,
        many=True,
        required=False
    )

    def create(self, validated_data):
        request = self.context.get('request')
        agreement_details = request.data.get('agreement_details')
        bceid_comment = request.data.pop('bceid_comment')
        transaction_type = agreement_details.get('transaction_type')
        optional_agreement_id = agreement_details.get('optional_agreement_id')
        obj = CreditAgreement.objects.create(
            transaction_type=transaction_type,
            optional_agreement_id=optional_agreement_id,
            **validated_data
        )
        if bceid_comment:
            CreditAgreementComment.objects.create(
                create_user=request.user.username,
                credit_agreement=obj,
                comment=bceid_comment,
                to_director=False,
            )
        history = CreditAgreementHistory.objects.create(
                credit_agreement=obj,
                status=obj.status,
                update_user=request.user.username,
                create_user=request.user.username
            )
        adjustments = request.data.get('content', None)
        if adjustments and isinstance(adjustments, list):
            CreditAgreementContent.objects.filter(
                credit_agreement=obj
            ).delete()

            for adjustment in adjustments:
                model_year = ModelYear.objects.filter(
                    name=adjustment.get('model_year')
                ).first()

                credit_class = CreditClass.objects.filter(
                    credit_class=adjustment.get('credit_class')
                ).first()

                if model_year and credit_class and adjustment.get('quantity'):
                    CreditAgreementContent.objects.create(
                        credit_class_id=credit_class.id,
                        model_year_id=model_year.id,
                        number_of_credits=adjustment.get('quantity'),
                        credit_agreement=obj,
                        create_user=request.user.username,
                        update_user=request.user.username,
                    )

        return obj

    def update(self, instance, validated_data):
        request = self.context.get('request')
        agreement_attachments = validated_data.pop('agreement_attachments', [])
        files_to_be_removed = request.data.get('delete_files', [])
        credit_agreement_comment = validated_data.pop('agreement_comment', None)
        status = request.data.get('validation_status')
        if status and (
            status != 'DELETED' or (
                status == 'DELETED' and instance.status == CreditAgreementStatuses.DRAFT)
                ):
            history = CreditAgreementHistory.objects.create(
                credit_agreement=instance,
                status=status,
                update_user=request.user.username,
                create_user=request.user.username
            )
            instance.status = status
            instance.save()
            history.save()
        
        if credit_agreement_comment:
            CreditAgreementComment.objects.create(
                create_user=request.user.username,
                credit_agreement=instance,
                comment=agreement_comment.get('comment')
            )

        for attachment in agreement_attachments:
            CreditAgreementAttachment.objects.create(
                create_user=request.user.username,
                credit_agreement=instance,
                **attachment
            )

        for file_id in files_to_be_removed:
            attachment = CreditAgreementAttachment.objects.filter(
                id=file_id,
                credit_agreement=instance
            ).first()

            if attachment:
                minio_remove_object(attachment.minio_object_name)

                attachment.is_removed = True
                attachment.update_user = request.user.username
                attachment.save()

        for data in validated_data:
            setattr(instance, data, validated_data[data])

            if data == 'make':
                make = validated_data[data]
                make = " ".join(make.upper().split())

                setattr(instance, data, make)

        instance.update_user = request.user.username
        instance.save()

        return instance

    class Meta:
        model = CreditAgreement
        fields = (
            'create_timestamp', 'organization', 'effective_date', 'id',
            'update_user', 'status', 'transaction_type', 'agreement_attachments'
        )


class CreditAgreementListSerializer(
        ModelSerializer, EnumSupportSerializerMixin, CreditAgreementBaseSerializer
):
    # history = SerializerMethodField()
    organization = OrganizationSerializer()
    credit_agreement_content = CreditAgreementContentSerializer(
        many=True, read_only=True
    )
    status = SerializerMethodField()
    update_user = SerializerMethodField()

    def get_status(self, obj):
        return obj.get_status_display()

    class Meta:
        model = CreditAgreement
        fields = (
            'create_timestamp', 'organization', 'effective_date',
            'transaction_type', 'credit_agreement_content', 'id',
            'status', 'update_user', 'history',
        )

class CreditAgreementReadSerializer(
        ModelSerializer, EnumSupportSerializerMixin, CreditAgreementBaseSerializer
):


    organization = OrganizationSerializer()
    status = EnumField(CreditAgreementStatuses)
    transaction_type = SerializerMethodField()
    credit_agreement_content = CreditAgreementContentSerializer(
        many=True, read_only=True
    )

    def get_transaction_type(self, obj):
        return obj.get_transaction_type_display()

    class Meta:
        model = CreditAgreement
        fields = (
            'id', 'status','transaction_type','effective_date','organization','credit_agreement_content',
        )
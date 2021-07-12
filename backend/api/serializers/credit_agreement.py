from rest_framework.serializers import ModelSerializer, SerializerMethodField, SlugRelatedField
from .organization import OrganizationSerializer
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from api.models.credit_agreement import CreditAgreement
from api.serializers.credit_agreement_content import \
    CreditAgreementContentSerializer
from api.models.credit_agreement_statuses import CreditAgreementStatuses
from api.models.credit_agreement_transaction_types import CreditAgreementTransactionTypes
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer
from api.serializers.credit_agreement_attachment import CreditAgreementAttachmentSerializer
from api.models.credit_agreement_attachment import CreditAgreementAttachment

class CreditAgreementBaseSerializer:
    def get_update_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.update_user


class CreditAgreementSerializer(ModelSerializer, CreditAgreementBaseSerializer):
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = CreditAgreement
        fields = (
            'id', 'organization', 'effective_date', 'transaction_type',
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
        transaction_type = agreement_details.get('transaction_type')
        obj = CreditAgreement.objects.create(
            transaction_type=transaction_type,
            **validated_data
        )
        return obj

    def update(self, instance, validated_data):
        status = validated_data.get('validation_status')
        request = self.context.get('request')
        agreement_attachments = validated_data.pop('agreement_attachments', [])
        files_to_be_removed = request.data.get('delete_files', [])
        credit_agreement_comment = validated_data.pop('agreement_comment', None)

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

        if status:
            notifications_zev_model(instance, status)

        return instance

    class Meta:
        model = CreditAgreement
        fields = (
            'create_timestamp', 'organization',  'effective_date', 'id',
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
            'create_timestamp', 'organization',  'effective_date',
            'transaction_type', 'credit_agreement_content', 'id',
            'status', 'update_user', 'history',
        )



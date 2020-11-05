from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_content import CreditTransferContent
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.models.user_profile import UserProfile
from api.models.credit_transfer_comment import CreditTransferComment
from api.serializers.credit_transfer_comment import CreditTransferCommentSerializer
from api.serializers.credit_transfer_content import \
    CreditTransferContentSerializer, CreditTransferContentSaveSerializer
from api.serializers.user import MemberSerializer
from api.serializers.organization import OrganizationSerializer


class CreditTransferBaseSerializer:
    def get_update_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.update_user


class CreditTransferSerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        CreditTransferBaseSerializer
):
    credit_to = OrganizationSerializer()
    credit_transfer_content = CreditTransferContentSerializer(
        many=True, read_only=True
    )
    debit_from = OrganizationSerializer()
    status = EnumField(CreditTransferStatuses, read_only=True)
    update_user = SerializerMethodField()
    credit_transfer_comment = SerializerMethodField()

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
            'debit_from', 'id', 'status', 'update_user', 'credit_transfer_comment'
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
        records = request.data.get('records')
        content = request.data.get('content')
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
            instance.status = validation_status
            instance.update_user = request.user.username
            instance.save()
        return instance

    def create(self, validated_data):
        request = self.context.get('request')
        content = request.data.get('content')

        credit_transfer = CreditTransfer.objects.create(
            credit_to=validated_data.get('credit_to'),
            debit_from=validated_data.get('debit_from'),
            status=validated_data.get('status'),
            create_user=request.user.username,
            update_user=request.user.username
        )

        if content:
            serializer = CreditTransferContentSaveSerializer(
                data=content, many=True, context={
                    'credit_transfer': credit_transfer
                }
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

        serializer = CreditTransferSerializer(credit_transfer, read_only=True)

        return serializer.data

    class Meta:
        model = CreditTransfer
        fields = ('id', 'status', 'credit_to', 'debit_from', 'content', 'credit_transfer_comment')

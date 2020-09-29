from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.models.user_profile import UserProfile
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

    class Meta:
        model = CreditTransfer
        fields = (
            'create_timestamp', 'credit_to', 'credit_transfer_content',
            'debit_from', 'id', 'status', 'update_user',
        )


class CreditTransferSaveSerializer(ModelSerializer):
    """
    Serializer to create a transfer
    """
    status = EnumField(CreditTransferStatuses)
    content = CreditTransferContentSaveSerializer(allow_null=True, many=True)

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
        fields = ('id', 'status', 'credit_to', 'debit_from', 'content')

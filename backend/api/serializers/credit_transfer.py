from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_content import CreditTransferContent
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.models.credit_transaction import CreditTransaction
from api.models.organization import Organization
from api.models.user_profile import UserProfile
from api.serializers.credit_transaction import CreditTransactionSerializer, \
    CreditTransactionSaveSerializer
from api.serializers.user import MemberSerializer
from api.serializers.organization import OrganizationSerializer


class CreditTransferSerializer(
        ModelSerializer, EnumSupportSerializerMixin
):
    debit_from = OrganizationSerializer()
    credit_to = OrganizationSerializer()
    status = EnumField(CreditTransferStatuses, read_only=True)
    credit_transactions = SerializerMethodField()
    update_user = SerializerMethodField()

    def get_credit_transactions(self, obj):
        credit_transactions = CreditTransaction.objects.filter(
            credit_transfer_content__credit_transfer_id=obj.id
        )

        serializer = CreditTransactionSerializer(
            credit_transactions, many=True, read_only=True
        )

        return serializer.data

    def get_update_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.update_user

    class Meta:
        model = CreditTransfer
        fields = (
            'id', 'status', 'credit_transactions', 'debit_from', 'credit_to',
            'create_timestamp', 'update_user',
        )


class CreditTransferSaveSerializer(ModelSerializer):
    """
    Serializer to create a transfer
    """
    status = EnumField(CreditTransferStatuses)

    def create(self, validated_data):
        request = self.context.get('request')
        data = request.data.get('data')

        serializer = CreditTransactionSaveSerializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        credit_transactions = serializer.save()

        credit_transfer = CreditTransfer.objects.create(
            credit_to=validated_data.get('credit_to'),
            debit_from=validated_data.get('debit_from'),
            status=validated_data.get('status'),
            create_user=request.user.username,
            update_user=request.user.username
        )

        for credit_transaction in credit_transactions:
            CreditTransferContent.objects.create(
                credit_transaction=credit_transaction,
                credit_transfer=credit_transfer,
                create_user=request.user.username,
                update_user=request.user.username
            )

        serializer = CreditTransferSerializer(credit_transfer, read_only=True)

        return serializer.data

    class Meta:
        model = CreditTransfer
        fields = ('id', 'status', 'credit_to', 'debit_from',)

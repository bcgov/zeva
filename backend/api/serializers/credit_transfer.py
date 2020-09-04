from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_content import CreditTransferContent
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.serializers.credit_transaction import CreditTransactionSerializer, \
    CreditTransactionSaveSerializer


class CreditTransferSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    status = EnumField(CreditTransferStatuses, read_only=True)
    credit_transactions = CreditTransactionSerializer(
        many=True, read_only=True
    )

    class Meta:
        model = CreditTransfer
        fields = ('id', 'status', 'credit_transactions',)


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
        fields = ('id', 'status',)

from rest_framework import serializers

from api.models.credit_class import CreditClass
from api.models.credit_transaction import CreditTransaction
from api.models.credit_transaction_type import CreditTransactionType
from api.serializers.organization import OrganizationSerializer


class CreditClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditClass
        fields = (
            'credit_class',
        )


class CreditTransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditTransactionType
        fields = (
            'transaction_type',
        )


class CreditTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for credit transactions
    """
    debit_from = OrganizationSerializer()
    credit_to = OrganizationSerializer()
    credit_class = CreditClassSerializer()
    transaction_type = CreditTransactionTypeSerializer()

    class Meta:
        model = CreditTransaction
        fields = (
            'credit_value', 'credit_to', 'debit_from', 'transaction_timestamp', 'credit_class',
            'transaction_type', 'id'
        )

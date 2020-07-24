"""
Account Balance Serializer
"""
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.account_balance import AccountBalance
from api.serializers.credit_transaction import CreditClassSerializer
from api.serializers.user import MemberSerializer


class AccountBalanceSerializer(ModelSerializer):
    """
    Serializer for balances
    """
    credit_class = CreditClassSerializer(read_only=True)

    class Meta:
        model = AccountBalance
        fields = (
            'id', 'create_timestamp', 'balance', 'credit_class',
        )
        read_only_fields = (
            'id',
        )

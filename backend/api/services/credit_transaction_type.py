from api.models.credit_transaction_type import CreditTransactionType


def get_transaction_type(type):
    return CreditTransactionType.objects.get(transaction_type=type)

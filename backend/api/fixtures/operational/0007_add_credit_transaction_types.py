from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.credit_transaction_type import CreditTransactionType


class AddCreditTransactionTypes(OperationalDataScript):
    """
    Adds the credit transaction types
    """
    is_revertable = False
    comment = 'Adds the credit transaction types'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        CreditTransactionType.objects.get_or_create(
            transaction_type='Validation'
        )
        CreditTransactionType.objects.get_or_create(
            transaction_type='Reduction'
        )


script_class = AddCreditTransactionTypes

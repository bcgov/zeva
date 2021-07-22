from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.credit_transaction_type import CreditTransactionType


class AddCreditTransactionTypes(OperationalDataScript):
    """
    Adds the agreement types
    """
    is_revertable = False
    comment = 'Adds the credit transfer transaction type'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        CreditTransactionType.objects.get_or_create(
            transaction_type='Credit Adjustment Validation'
        )
        CreditTransactionType.objects.get_or_create(
            transaction_type='Credit Adjustment Reduction'
        )


script_class = AddCreditTransactionTypes

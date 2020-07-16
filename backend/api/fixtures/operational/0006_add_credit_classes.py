from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.credit_class import CreditClass


class AddCreditClasses(OperationalDataScript):
    """
    Adds the credit classes: A and B
    """
    is_revertable = False
    comment = 'Adds the credit classes: A and B'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        CreditClass.objects.get_or_create(
            credit_class='A',
            effective_date="2018-01-01"
        )
        CreditClass.objects.get_or_create(
            credit_class='B',
            effective_date="2018-01-01"
        )


script_class = AddCreditClasses

from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.credit_class import CreditClass


class UpdateCreditClasses(OperationalDataScript):
    is_revertable = False
    comment = 'Updates the credit classes'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        CreditClass.objects.get_or_create(
            credit_class='C',
            defaults={
                'effective_date': "2018-01-01"
            }
        )


script_class = UpdateCreditClasses

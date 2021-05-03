from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear


class UpdateModelYear(OperationalDataScript):
    """
    Add 2022-2023 model years
    """
    is_revertable = False
    comment = 'Add 2022-2023 model years'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        ModelYear.objects.update_or_create(
            name="2022",
            defaults={
                'effective_date': "2022-01-01",
                'expiration_date': "2022-12-31"
            }
        )

        ModelYear.objects.update_or_create(
            name="2023",
            defaults={
                'effective_date': "2023-01-01",
                'expiration_date': "2023-12-31"
            }
        )


script_class = UpdateModelYear

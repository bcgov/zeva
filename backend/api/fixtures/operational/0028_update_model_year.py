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
        to_check = ["2022,2023"]
        for year in to_check:
            if ModelYear.objects.filter(name=year).exists():
                return False
        return True

    @transaction.atomic
    def run(self):
        ModelYear.objects.create(
            effective_date="2022-01-01",
            expiration_date="2022-12-31",
            name="2022"
        )

        ModelYear.objects.create(
            effective_date="2023-01-01",
            expiration_date="2023-12-31",
            name="2023"
        )


script_class = UpdateModelYear

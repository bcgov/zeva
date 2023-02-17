from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear


class AddModelYears(OperationalDataScript):
    """
    Adds the vehicle makes that we can find from the NRCAN document such as
    BMW, Chevrolet, Chrysler, Ford, Honda, Hyundai
    """
    is_revertable = False
    comment = 'Adds the vehicle makes found in the NRCAN document'

    def check_run_preconditions(self):
        to_check = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"]
        for year in to_check:
            if ModelYear.objects.filter(name=year).exists():
                return False
        return True

    @transaction.atomic
    def run(self):
        ModelYear.objects.create(
            id=1,
            effective_date="2019-01-01",
            expiration_date="2019-12-31",
            name="2019"
        )

        ModelYear.objects.create(
            id=2,
            effective_date="2020-01-01",
            expiration_date="2020-12-31",
            name="2020"
        )


script_class = AddModelYears

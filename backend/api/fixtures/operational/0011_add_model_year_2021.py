from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear


class AddModelYears2021(OperationalDataScript):
    """
    Adds the vehicle makes that we can find from the NRCAN document such as
    BMW, Chevrolet, Chrysler, Ford, Honda, Hyundai
    """
    is_revertable = False
    comment = 'Adds the vehicle makes found in the NRCAN document'

    def check_run_preconditions(self):
        to_check = ["2021"]
        for year in to_check:
            if ModelYear.objects.filter(name=year).exists():
                return False
        return True

    @transaction.atomic
    def run(self):
        ModelYear.objects.create(
            effective_date="2021-01-01",
            expiration_date="2021-12-31",
            name="2021"
        )


script_class = AddModelYears2021

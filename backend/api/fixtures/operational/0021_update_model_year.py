from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear


class UpdateModelYear(OperationalDataScript):
    """
    Add 2017-2018 model years
    """
    is_revertable = False
    comment = 'Add 2017-2018 model years'

    def check_run_preconditions(self):
        to_check = ["2017,2018"]
        for year in to_check:
            if ModelYear.objects.filter(name=year).exists():
                return False
        return True

    @transaction.atomic
    def run(self):
        ModelYear.objects.create(
            id=8,
            effective_date="2017-01-01",
            expiration_date="2017-12-31",
            name="2017"
        )

        ModelYear.objects.create(
            id=9,
            effective_date="2018-01-01",
            expiration_date="2018-12-31",
            name="2018"
        )
        


script_class = UpdateModelYear

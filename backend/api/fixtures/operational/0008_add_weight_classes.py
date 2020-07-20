from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.weight_class import WeightClass


class AddWeightClasses(OperationalDataScript):
    """
    Adds the weight class: LDV
    """
    is_revertable = False
    comment = 'Adds the weight class: LDV'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        WeightClass.objects.get_or_create(
            description="Light Duty Vehicle",
            effective_date="2018-01-01",
            weight_class_code='LDV'
        )


script_class = AddWeightClasses

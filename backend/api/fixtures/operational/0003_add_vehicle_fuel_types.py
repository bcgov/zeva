from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.vehicle_fuel_type import FuelType


class AddFuelTypes(OperationalDataScript):
    """
    Adds the Fuel types found in the NRCAN 2019 Fuel Consumption Guide
    """
    is_revertable = False
    comment = 'Adds the Fuel types found in the NRCAN 2019 Fuel Consumption ' \
              'Guide'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        FuelType.objects.create(
            code="B",
            description="Electricity",
            effective_date="2019-01-01"
        )
        FuelType.objects.create(
            code="BX",
            description="Electricity/Regular Gasoline",
            effective_date="2019-01-01"
        )
        FuelType.objects.create(
            code="BZ",
            description="Electricity/Premium Gasoline",
            effective_date="2019-01-01"
        )


script_class = AddFuelTypes

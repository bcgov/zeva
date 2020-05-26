from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.vehicle_zev_type import ZevType


class AddZevTypes(OperationalDataScript):
    """
    Adds the ZEV types
    """
    is_revertable = False
    comment = 'Adds the ZEV types'

    def check_run_preconditions(self):
        return not ZevType.objects.filter(vehicle_zev_code="BEV").exists()

    @transaction.atomic
    def run(self):
        ZevType.objects.create(
            vehicle_zev_code="BEV",
            description="Battery Electric Vehicle",
            effective_date="2019-01-01"
        )
        ZevType.objects.create(
            vehicle_zev_code="PHEV",
            description="Plug-in Hybrid Electric Vehicle",
            effective_date="2019-01-01"
        )
        ZevType.objects.create(
            vehicle_zev_code="EREV",
            description="Extended Range Electric Vehicle",
            effective_date="2019-01-01"
        )
        ZevType.objects.create(
            vehicle_zev_code="FCEV",
            description="Hydrogen Fuel Cell Electric Vehicle",
            effective_date="2019-01-01"
        )


script_class = AddZevTypes

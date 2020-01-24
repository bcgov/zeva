from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.vehicle_class import VehicleClass


class AddVehicleClasses(OperationalDataScript):
    """
    Adds the Vehicle Classes found in the NRCAN 2019 Fuel Consumption Guide
    """
    is_revertable = False
    comment = 'Adds the Vehicle Classes found in the NRCAN 2019 Fuel ' \
              'Consumption Guide'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        VehicleClass.objects.create(
            id="T",
            description="Two-seater",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="I",
            description="Minicompact",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="S",
            description="Subcompact",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="C",
            description="Compact",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="M",
            description="Mid-size",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="L",
            description="Full-size",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="WS",
            description="Station wagon (Small)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="WM",
            description="Station wagon (Mid-size)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="PS",
            description="Pickup truck (Small)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="PL",
            description="Pickup truck (Standard)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="US",
            description="Sport utility vehicle (Small)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="UL",
            description="Sport utility vehicle (Standard)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="V",
            description="Minivan",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="VC",
            description="Van (Cargo)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="VP",
            description="Van (Passenger)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            id="SP",
            description="Special purpose vehicle",
            effective_date="2019-01-01"
        )


script_class = AddVehicleClasses

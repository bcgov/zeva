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
        return not VehicleClass.objects.filter(vehicle_class_code="T").exists()

    @transaction.atomic
    def run(self):
        VehicleClass.objects.create(
            vehicle_class_code="T",
            description="Two-seater",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="I",
            description="Minicompact",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="S",
            description="Subcompact",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="C",
            description="Compact",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="M",
            description="Mid-size",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="L",
            description="Full-size",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="WS",
            description="Station wagon (Small)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="WM",
            description="Station wagon (Mid-size)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="PS",
            description="Pickup truck (Small)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="PL",
            description="Pickup truck (Standard)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="US",
            description="Sport utility vehicle (Small)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="UL",
            description="Sport utility vehicle (Standard)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="V",
            description="Minivan",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="VC",
            description="Van (Cargo)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="VP",
            description="Van (Passenger)",
            effective_date="2019-01-01"
        )
        VehicleClass.objects.create(
            vehicle_class_code="SP",
            description="Special purpose vehicle",
            effective_date="2019-01-01"
        )


script_class = AddVehicleClasses

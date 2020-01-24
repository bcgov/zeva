from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.vehicle import Vehicle
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model


class AddPluginHybridVehicles(OperationalDataScript):
    """
    Adds the Plug-in hybrid electric vehicles found in the NRCAN 2019
    Fuel Consumption Guide
    """
    is_revertable = False
    comment = 'Adds the Fuel types found in the NRCAN 2019 Fuel Consumption ' \
              'Guide'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        make = Make.objects.get(description="BMW")
        model = Model.objects.create(
            description="530e",
            make=make
        )
        Vehicle.objects.create(
            fuel_type="BZ",
            is_validated=True,
            make=make,
            model=model,
            range="26",
            state="VALIDATED",
            vehicle_class="C"
        )

        model = Model.objects.create(
            description="530e xDRIVE",
            make=make
        )
        Vehicle.objects.create(
            fuel_type="BZ",
            is_validated=True,
            make=make,
            model=model,
            range="24",
            state="VALIDATED",
            vehicle_class="C"
        )

        model = Model.objects.create(
            description="i3 REx (120 Ah)",
            make=make
        )
        Vehicle.objects.create(
            fuel_type="BZ",
            is_validated=True,
            make=make,
            model=model,
            range="203",
            state="VALIDATED",
            vehicle_class="S"
        )

        model = Model.objects.create(
            description="i3s REx (120 Ah)",
            make=make
        )
        Vehicle.objects.create(
            fuel_type="BZ",
            is_validated=True,
            make=bmw,
            model=model,
            range="203",
            state="VALIDATED",
            vehicle_class="S"
        )

        model = Model.objects.create(
            description="i8 COUPE",
            make=make
        )
        Vehicle.objects.create(
            fuel_type="BZ",
            is_validated=True,
            make=make,
            model=model,
            range="29",
            state="VALIDATED",
            vehicle_class="S"
        )

        model = Model.objects.create(
            description="i8 ROADSTER",
            make=make
        )
        Vehicle.objects.create(
            fuel_type="BZ",
            is_validated=True,
            make=make,
            model=model,
            range="29",
            state="VALIDATED",
            vehicle_class="S"
        )

        make = Make.objects.get(description="Chevrolet")
        model = Model.objects.create(
            description="VOLT",
            make=make
        )
        Vehicle.objects.create(
            fuel_type="B",
            is_validated=True,
            make=make,
            model=model,
            range="85",
            state="VALIDATED",
            vehicle_class="C"
        )

        make = Make.objects.get(description="Ford")
        model = Model.objects.create(
            description="FUSION ENERGI",
            make=make
        )
        Vehicle.objects.create(
            fuel_type="BX",
            is_validated=True,
            make=make,
            model=model,
            range="42",
            state="VALIDATED",
            vehicle_class="M"
        )

script_class = AddPluginHybridVehicles

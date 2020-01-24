from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model


class AddBatteryElectricVehicles(OperationalDataScript):
    """
    Adds the Battery electric vehicles found in the NRCAN 2019
    Fuel Consumption Guide
    """
    is_revertable = False
    comment = 'Adds the Battery electric vehicles found in the NRCAN 2019 ' \
              'Fuel Consumption Guide'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        model_year = ModelYear.objects.get(name="2019")
        make = Make.objects.get(name="Audi")
        model = Model.objects.create(
            name="e-tron 55 QUATTRO",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="329",
            state="VALIDATED",
            vehicle_class_id="UL"
        )

        make = Make.objects.get(name="BMW")
        model = Model.objects.create(
            name="i3 (120 Ah)",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="246",
            state="VALIDATED",
            vehicle_class_id="S"
        )

        model = Model.objects.create(
            name="i3s (120 Ah)",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="246",
            state="VALIDATED",
            vehicle_class_id="S"
        )

        make = Make.objects.get(name="Chevrolet")
        model = Model.objects.create(
            name="BOLT EV",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="383",
            state="VALIDATED",
            vehicle_class_id="WS"
        )

        make = Make.objects.get(name="Hyundai")
        model = Model.objects.create(
            name="IONIQ ELECTRIC",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="200",
            state="VALIDATED",
            vehicle_class_id="M"
        )
        model = Model.objects.create(
            name="KONA ELECTRIC",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="415",
            state="VALIDATED",
            vehicle_class_id="US"
        )

        make = Make.objects.get(name="Kia")
        model = Model.objects.create(
            name="NIRO EV",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="385",
            state="VALIDATED",
            vehicle_class_id="WS"
        )
        model = Model.objects.create(
            name="SOUL EV",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="179",
            state="VALIDATED",
            vehicle_class_id="WS"
        )

        make = Make.objects.get(name="Nissan")
        model = Model.objects.create(
            name="LEAF (40 kWh)",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="243",
            state="VALIDATED",
            vehicle_class_id="M"
        )
        model = Model.objects.create(
            name="LEAF S PLUS",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="363",
            state="VALIDATED",
            vehicle_class_id="M"
        )
        model = Model.objects.create(
            name="LEAF SV/SL PLUS",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="349",
            state="VALIDATED",
            vehicle_class_id="M"
        )

        make = Make.objects.get(name="Smart EQ")
        model = Model.objects.create(
            name="FORTWO CABRIOLET",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="92",
            state="VALIDATED",
            vehicle_class_id="T"
        )
        model = Model.objects.create(
            name="FORTWO COUPE",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="93",
            state="VALIDATED",
            vehicle_class_id="T"
        )

        make = Make.objects.get(name="Tesla")
        model = Model.objects.create(
            name="MODEL 3 Standard Range",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="151",
            state="VALIDATED",
            vehicle_class_id="M"
        )
        model = Model.objects.create(
            name="MODEL 3 Standard Range Plus",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="386",
            state="VALIDATED",
            vehicle_class_id="M"
        )
        model = Model.objects.create(
            name="MODEL 3 Mid Range",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="425",
            state="VALIDATED",
            vehicle_class_id="M"
        )
        model = Model.objects.create(
            name="MODEL 3 Long Range",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="499",
            state="VALIDATED",
            vehicle_class_id="M"
        )
        model = Model.objects.create(
            name="MODEL 3 Long Range AWD",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="499",
            state="VALIDATED",
            vehicle_class_id="M"
        )
        model = Model.objects.create(
            name="MODEL 3 Long Range AWD Performance",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="499",
            state="VALIDATED",
            vehicle_class_id="M"
        )
        model = Model.objects.create(
            name="MODEL S 75D",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="417",
            state="VALIDATED",
            vehicle_class_id="L"
        )
        model = Model.objects.create(
            name="MODEL S 100D",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="539",
            state="VALIDATED",
            vehicle_class_id="L"
        )
        model = Model.objects.create(
            name="MODEL S P100D",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="507",
            state="VALIDATED",
            vehicle_class_id="L"
        )
        model = Model.objects.create(
            name="MODEL S Standard Range",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="459",
            state="VALIDATED",
            vehicle_class_id="L"
        )
        model = Model.objects.create(
            name="MODEL S Long Range",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="595",
            state="VALIDATED",
            vehicle_class_id="L"
        )
        model = Model.objects.create(
            name='MODEL S Performance (19" Wheels)',
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="555",
            state="VALIDATED",
            vehicle_class_id="L"
        )
        model = Model.objects.create(
            name='MODEL S Performance (21" Wheels)',
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="523",
            state="VALIDATED",
            vehicle_class_id="L"
        )
        model = Model.objects.create(
            name="MODEL X 75D",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="383",
            state="VALIDATED",
            vehicle_class_id="UL"
        )
        model = Model.objects.create(
            name="MODEL X 100D",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="475",
            state="VALIDATED",
            vehicle_class_id="UL"
        )
        model = Model.objects.create(
            name="MODEL X P100D",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="465",
            state="VALIDATED",
            vehicle_class_id="UL"
        )
        model = Model.objects.create(
            name="MODEL X Standard Range",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="410",
            state="VALIDATED",
            vehicle_class_id="UL"
        )
        model = Model.objects.create(
            name="MODEL X Long Range",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="523",
            state="VALIDATED",
            vehicle_class_id="UL"
        )
        model = Model.objects.create(
            name='MODEL X Performance (20" Wheels)',
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="491",
            state="VALIDATED",
            vehicle_class_id="UL"
        )
        model = Model.objects.create(
            name='MODEL X Performance (22" Wheels)',
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="435",
            state="VALIDATED",
            vehicle_class_id="UL"
        )

        make = Make.objects.get(name="Volkswagen")
        model = Model.objects.create(
            name="e-GOLF",
            make=make
        )
        Vehicle.objects.create(
            fuel_type_id="B",
            make=make,
            model=model,
            model_year=model_year,
            range="201",
            state="VALIDATED",
            vehicle_class_id="C"
        )


script_class = AddBatteryElectricVehicles

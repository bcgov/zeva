from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle
from api.models.vehicle_class import VehicleClass
from api.models.vehicle_fuel_type import FuelType
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model


class AddPluginHybridVehicles(OperationalDataScript):
    """
    Adds the Plug-in hybrid electric vehicles found in the NRCAN 2019
    Fuel Consumption Guide
    """
    is_revertable = False
    comment = 'Adds the Plug-in hybrid electric vehicles found in the ' \
              'NRCAN 2019 Fuel Consumption Guide'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        model_year = ModelYear.objects.get(name="2019")
        make = Make.objects.get(name="BMW")
        model = Model.objects.create(
            name="530e",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="26",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="C")
        )

        model = Model.objects.create(
            name="530e xDRIVE",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="24",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="C")
        )

        model = Model.objects.create(
            name="i3 REx (120 Ah)",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="203",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        model = Model.objects.create(
            name="i3s REx (120 Ah)",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="203",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        model = Model.objects.create(
            name="i8 COUPE",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="29",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        model = Model.objects.create(
            name="i8 ROADSTER",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="29",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        make = Make.objects.get(name="Chevrolet")
        model = Model.objects.create(
            name="VOLT",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="B"),
            make=make,
            model=model,
            model_year=model_year,
            range="85",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="C")
        )

        make = Make.objects.get(name="Ford")
        model = Model.objects.create(
            name="FUSION ENERGI",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model=model,
            model_year=model_year,
            range="42",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Honda")
        model = Model.objects.create(
            name="CLARITY PLUG-IN",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model=model,
            model_year=model_year,
            range="77",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Hyundai")
        model = Model.objects.create(
            name="IONIQ ELECTRIC PLUS",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model=model,
            model_year=model_year,
            range="47",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        model = Model.objects.create(
            name="SONATA PLUG-IN",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model=model,
            model_year=model_year,
            range="45",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Karma")
        model = Model.objects.create(
            name="REVERO",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="B"),
            make=make,
            model=model,
            model_year=model_year,
            range="60",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        make = Make.objects.get(name="Kia")
        model = Model.objects.create(
            name="NIRO PLUG-IN",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model=model,
            model_year=model_year,
            range="42",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="WS")
        )

        model = Model.objects.create(
            name="OPTIMA PLUG-IN",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model=model,
            model_year=model_year,
            range="47",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Mercedes-Benz")
        model = Model.objects.create(
            name="GLC 350e 4MATIC",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="21",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="US")
        )

        make = Make.objects.get(name="Mini")
        model = Model.objects.create(
            name="COOPER S E COUNTRYMAN ALL4",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="19",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Mitsubishi")
        model = Model.objects.create(
            name="OUTLANDER PHEV AWD",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model=model,
            model_year=model_year,
            range="35",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="US")
        )

        make = Make.objects.get(name="Porsche")
        model = Model.objects.create(
            name="CAYENNE E-HYBRID",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="21",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )

        model = Model.objects.create(
            name="PANAMERA 4 E-HYBRID",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="B"),
            make=make,
            model=model,
            model_year=model_year,
            range="23",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )

        model = Model.objects.create(
            name="PANAMERA TURBO S E-HYBRID",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="B"),
            make=make,
            model=model,
            model_year=model_year,
            range="23",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )

        make = Make.objects.get(name="Toyota")
        model = Model.objects.create(
            name="PRIUS PRIME",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model=model,
            model_year=model_year,
            range="40",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Volvo")
        model = Model.objects.create(
            name="S90 T8 AWD",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="34",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        model = Model.objects.create(
            name="XC60 T8 AWD",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="27",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="US")
        )

        model = Model.objects.create(
            name="XC90 T8 AWD",
            make=make
        )
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model=model,
            model_year=model_year,
            range="27",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )

script_class = AddPluginHybridVehicles

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
        model = "530e"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="26",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="C")
        )

        model = "530e xDRIVE"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="24",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="C")
        )

        model = "i3 REx (120 Ah)"

        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="203",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        model = "i3s REx (120 Ah)"

        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="203",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        model = "i8 COUPE"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="29",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        model = "i8 ROADSTER"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="29",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        make = Make.objects.get(name="Chevrolet")
        model = "VOLT"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="B"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="85",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="C")
        )

        make = Make.objects.get(name="Ford")
        model = "FUSION ENERGI"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="42",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Honda")
        model = "CLARITY PLUG-IN"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="77",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Hyundai")
        model = "IONIQ ELECTRIC PLUS"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="47",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        model = "SONATA PLUG-IN"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="45",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Karma")
        model = "REVERO"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="B"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="60",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        make = Make.objects.get(name="Kia")
        model = "NIRO PLUG-IN"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="42",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="WS")
        )

        model = "OPTIMA PLUG-IN"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="47",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Mercedes-Benz")
        model = "GLC 350e 4MATIC"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="21",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="US")
        )

        make = Make.objects.get(name="Mini")
        model = "COOPER S E COUNTRYMAN ALL4"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="19",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Mitsubishi")
        model = "OUTLANDER PHEV AWD"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="35",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="US")
        )

        make = Make.objects.get(name="Porsche")
        model = "CAYENNE E-HYBRID"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="21",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )

        model = "PANAMERA 4 E-HYBRID"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="B"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="23",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )

        model = "PANAMERA TURBO S E-HYBRID"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="B"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="23",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )

        make = Make.objects.get(name="Toyota")
        model = "PRIUS PRIME"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BX"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="40",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Volvo")
        model = "S90 T8 AWD"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="34",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        model = "XC60 T8 AWD"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="27",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="US")
        )

        model = "XC90 T8 AWD"
        Vehicle.objects.create(
            vehicle_fuel_type=FuelType.objects.get(vehicle_fuel_code="BZ"),
            make=make,
            model_name=model,
            model_year=model_year,
            range="27",
            state="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )

script_class = AddPluginHybridVehicles

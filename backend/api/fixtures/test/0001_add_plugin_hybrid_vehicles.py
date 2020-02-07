from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle
from api.models.vehicle_class import VehicleClass
from api.models.vehicle_fuel_type import FuelType
from api.models.vehicle_make import Make


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

        list_of_vehicles = [{
            "make": "BMW",
            "model": "530e",
            "fuel_type": "BZ",
            "range": "26",
            "class_code": "C"
        }, {
            "make": "BMW",
            "model": "530e xDRIVE",
            "fuel_type": "BZ",
            "range": "24",
            "class_code": "C"
        }, {
            "make": "BMW",
            "model": "i3 REx (120 Ah)",
            "fuel_type": "BZ",
            "range": "203",
            "class_code": "S"
        }, {
            "make": "BMW",
            "model": "i3s REx (120 Ah)",
            "fuel_type": "BZ",
            "range": "203",
            "class_code": "S"
        }, {
            "make": "BMW",
            "model": "i8 COUPE",
            "fuel_type": "BZ",
            "range": "29",
            "class_code": "S"
        }, {
            "make": "BMW",
            "model": "i8 ROADSTER",
            "fuel_type": "BZ",
            "range": "29",
            "class_code": "S"
        }, {
            "make": "Chevrolet",
            "model": "VOLT",
            "fuel_type": "B",
            "range": "85",
            "class_code": "C"
        }, {
            "make": "Ford",
            "model": "FUSION ENERGI",
            "fuel_type": "BX",
            "range": "42",
            "class_code": "M"
        }, {
            "make": "Honda",
            "model": "CLARITY PLUG-IN",
            "fuel_type": "BX",
            "range": "77",
            "class_code": "M"
        }, {
            "make": "Hyundai",
            "model": "IONIQ ELECTRIC PLUS",
            "fuel_type": "BX",
            "range": "47",
            "class_code": "M"
        }, {
            "make": "Hyundai",
            "model": "SONATA PLUG-IN",
            "fuel_type": "BX",
            "range": "45",
            "class_code": "M"
        }, {
            "make": "Karma",
            "model": "REVERO",
            "fuel_type": "B",
            "range": "60",
            "class_code": "S"
        }, {
            "make": "Kia",
            "model": "NIRO PLUG-IN",
            "fuel_type": "BX",
            "range": "42",
            "class_code": "WS"
        }, {
            "make": "Kia",
            "model": "OPTIMA PLUG-IN",
            "fuel_type": "BX",
            "range": "47",
            "class_code": "M"
        }, {
            "make": "Mercedes-Benz",
            "model": "GLC 350e 4MATIC",
            "fuel_type": "BZ",
            "range": "21",
            "class_code": "US"
        }, {
            "make": "Mini",
            "model": "COOPER S E COUNTRYMAN ALL4",
            "fuel_type": "BZ",
            "range": "19",
            "class_code": "M"
        }, {
            "make": "Mitsubishi",
            "model": "OUTLANDER PHEV AWD",
            "fuel_type": "BX",
            "range": "35",
            "class_code": "US"
        }, {
            "make": "Porsche",
            "model": "CAYENNE E-HYBRID",
            "fuel_type": "BZ",
            "range": "21",
            "class_code": "UL"
        }, {
            "make": "Porsche",
            "model": "PANAMERA 4 E-HYBRID",
            "fuel_type": "B",
            "range": "23",
            "class_code": "L"
        }, {
            "make": "Porsche",
            "model": "PANAMERA TURBO S E-HYBRID",
            "fuel_type": "B",
            "range": "23",
            "class_code": "L"
        }, {
            "make": "Toyota",
            "model": "PRIUS PRIME",
            "fuel_type": "BX",
            "range": "40",
            "class_code": "M"
        }, {
            "make": "Volvo",
            "model": "S90 T8 AWD",
            "fuel_type": "BZ",
            "range": "34",
            "class_code": "M"
        }, {
            "make": "Volvo",
            "model": "XC60 T8 AWD",
            "fuel_type": "BZ",
            "range": "27",
            "class_code": "US"
        }, {
            "make": "Volvo",
            "model": "XC90 T8 AWD",
            "fuel_type": "BZ",
            "range": "27",
            "class_code": "UL"
        }]

        vehicles_added = 0

        for vehicle in list_of_vehicles:
            Vehicle.objects.create(
                make=Make.objects.get(name=vehicle.get("make")),
                model_name=vehicle.get("model"),
                model_year=model_year,
                range=vehicle.get("range"),
                validation_status="VALIDATED",
                vehicle_class_code=VehicleClass.objects.get(
                    vehicle_class_code=vehicle.get("class_code")
                ),
                vehicle_fuel_type=FuelType.objects.get(
                    vehicle_fuel_code=vehicle.get("fuel_type")
                )
            )

            vehicles_added += 1

        print("Added {} vehicles.".format(vehicles_added))


script_class = AddPluginHybridVehicles

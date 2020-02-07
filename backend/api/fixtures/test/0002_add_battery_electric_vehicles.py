from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle
from api.models.vehicle_class import VehicleClass
from api.models.vehicle_fuel_type import FuelType
from api.models.vehicle_make import Make


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
        vehicle_fuel_type = FuelType.objects.get(vehicle_fuel_code="B")
        list_of_vehicles = [{
            "make": "Audi",
            "model": "e-tron 55 QUATTRO",
            "range": "329",
            "class_code": "UL"
        }, {
            "make": "BMW",
            "model": "i3 (120 Ah)",
            "range": "246",
            "class_code": "S"
        }, {
            "make": "BMW",
            "model": "i3s (120 Ah)",
            "range": "246",
            "class_code": "S"
        }, {
            "make": "Chevrolet",
            "model": "BOLT EV",
            "range": "383",
            "class_code": "WS"
        }, {
            "make": "Hyundai",
            "model": "IONIQ ELECTRIC",
            "range": "200",
            "class_code": "M"
        }, {
            "make": "Hyundai",
            "model": "KONA ELECTRIC",
            "range": "415",
            "class_code": "US"
        }, {
            "make": "Kia",
            "model": "NIRO EV",
            "range": "385",
            "class_code": "WS"
        }, {
            "make": "Kia",
            "model": "SOUL EV",
            "range": "179",
            "class_code": "WS"
        }, {
            "make": "Nissan",
            "model": "LEAF (40 kWh)",
            "range": "243",
            "class_code": "M"
        }, {
            "make": "Nissan",
            "model": "LEAF S PLUS",
            "range": "363",
            "class_code": "M"
        }, {
            "make": "Nissan",
            "model": "LEAF SV/SL PLUS",
            "range": "349",
            "class_code": "M"
        }, {
            "make": "Smart EQ",
            "model": "FORTWO CABRIOLET",
            "range": "92",
            "class_code": "T"
        }, {
            "make": "Smart EQ",
            "model": "FORTWO COUPE",
            "range": "93",
            "class_code": "T"
        }, {
            "make": "Tesla",
            "model": "MODEL 3 Standard Range",
            "range": "151",
            "class_code": "M"
        }, {
            "make": "Tesla",
            "model": "MODEL 3 Standard Range Plus",
            "range": "386",
            "class_code": "M"
        }, {
            "make": "Tesla",
            "model": "MODEL 3 Mid Range",
            "range": "425",
            "class_code": "M"
        }, {
            "make": "Tesla",
            "model": "MODEL 3 Long Range",
            "range": "499",
            "class_code": "M"
        }, {
            "make": "Tesla",
            "model": "MODEL 3 Long Range AWD",
            "range": "499",
            "class_code": "M"
        }, {
            "make": "Tesla",
            "model": "MODEL 3 Long Range AWD Performance",
            "range": "499",
            "class_code": "M"
        }, {
            "make": "Tesla",
            "model": "MODEL S 75D",
            "range": "417",
            "class_code": "L"
        }, {
            "make": "Tesla",
            "model": "MODEL S 100D",
            "range": "539",
            "class_code": "L"
        }, {
            "make": "Tesla",
            "model": "MODEL S P100D",
            "range": "507",
            "class_code": "L"
        }, {
            "make": "Tesla",
            "model": "MODEL S Standard Range",
            "range": "459",
            "class_code": "L"
        }, {
            "make": "Tesla",
            "model": "MODEL S Long Range",
            "range": "595",
            "class_code": "L"
        }, {
            "make": "Tesla",
            "model": 'MODEL S Performance (19" Wheels)',
            "range": "555",
            "class_code": "L"
        }, {
            "make": "Tesla",
            "model": 'MODEL S Performance (21" Wheels)',
            "range": "523",
            "class_code": "L"
        }, {
            "make": "Tesla",
            "model": "MODEL X 75D",
            "range": "383",
            "class_code": "UL"
        }, {
            "make": "Tesla",
            "model": "MODEL X 100D",
            "range": "475",
            "class_code": "UL"
        }, {
            "make": "Tesla",
            "model": "MODEL X P100D",
            "range": "465",
            "class_code": "UL"
        }, {
            "make": "Tesla",
            "model": "MODEL X Standard Range",
            "range": "410",
            "class_code": "UL"
        }, {
            "make": "Tesla",
            "model": "MODEL X Long Range",
            "range": "523",
            "class_code": "UL"
        }, {
            "make": "Tesla",
            "model": 'MODEL X Performance (20" Wheels)',
            "range": "491",
            "class_code": "UL"
        }, {
            "make": "Tesla",
            "model": 'MODEL X Performance (22" Wheels)',
            "range": "435",
            "class_code": "UL"
        }, {
            "make": "Volkswagen",
            "model": "e-GOLF",
            "range": "201",
            "class_code": "C"
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
                vehicle_fuel_type=vehicle_fuel_type
            )

            vehicles_added += 1

        print("Added {} vehicles.".format(vehicles_added))


script_class = AddBatteryElectricVehicles

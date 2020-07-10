from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear
from api.models.organization import Organization
from api.models.vehicle import Vehicle
from api.models.vehicle_class import VehicleClass
from api.models.vehicle_zev_type import ZevType


class AddBatteryElectricVehicles(OperationalDataScript):
    """
    Adds the Battery electric vehicles
    """
    is_revertable = False
    comment = 'Adds the Battery electric vehicles'

    list_of_vehicles = [{
        "class_code": "UL",
        "make": "Audi",
        "model": "e-tron 55 QUATTRO",
        "organization": "Volkswagen Group Canada Inc.",
        "range": "329"
    }, {
        "class_code": "S",
        "make": "BMW",
        "model": "i3 (120 Ah)",
        "organization": "BMW Canada Inc.",
        "range": "246"
    }, {
        "class_code": "S",
        "make": "BMW",
        "model": "i3s (120 Ah)",
        "organization": "BMW Canada Inc.",
        "range": "246"
    }, {
        "class_code": "WS",
        "make": "Chevrolet",
        "model": "BOLT EV",
        "organization": "FCA Canada Inc.",
        "range": "383"
    }, {
        "class_code": "M",
        "make": "Hyundai",
        "model": "IONIQ ELECTRIC",
        "organization": "Hyundai Auto Canada Corp.",
        "range": "200"
    }, {
        "class_code": "US",
        "make": "Hyundai",
        "model": "KONA ELECTRIC",
        "organization": "Hyundai Auto Canada Corp.",
        "range": "415"
    }, {
        "class_code": "WS",
        "make": "Kia",
        "model": "NIRO EV",
        "organization": "Kia Canada Inc.",
        "range": "385"
    }, {
        "class_code": "WS",
        "make": "Kia",
        "model": "SOUL EV",
        "organization": "Kia Canada Inc.",
        "range": "179"
    }, {
        "class_code": "M",
        "make": "Nissan",
        "model": "LEAF (40 kWh)",
        "organization": "Nissan Canada Inc.",
        "range": "243"
    }, {
        "class_code": "M",
        "make": "Nissan",
        "model": "LEAF S PLUS",
        "organization": "Nissan Canada Inc.",
        "range": "363"
    }, {
        "class_code": "M",
        "make": "Nissan",
        "model": "LEAF SV/SL PLUS",
        "organization": "Nissan Canada Inc.",
        "range": "349"
    }, {
        "class_code": "T",
        "make": "Smart EQ",
        "model": "FORTWO CABRIOLET",
        "organization": "Mercedes-Benz Canada Inc.",
        "range": "92",
    }, {
        "class_code": "T",
        "make": "Smart EQ",
        "model": "FORTWO COUPE",
        "organization": "Mercedes-Benz Canada Inc.",
        "range": "93"
    }, {
        "class_code": "M",
        "make": "Tesla",
        "model": "MODEL 3 Standard Range",
        "organization": "Tesla Motors Canada ULC",
        "range": "151"
    }, {
        "class_code": "M",
        "make": "Tesla",
        "model": "MODEL 3 Standard Range Plus",
        "organization": "Tesla Motors Canada ULC",
        "range": "386"
    }, {
        "class_code": "M",
        "make": "Tesla",
        "model": "MODEL 3 Mid Range",
        "organization": "Tesla Motors Canada ULC",
        "range": "425"
    }, {
        "class_code": "M",
        "make": "Tesla",
        "model": "MODEL 3 Long Range",
        "organization": "Tesla Motors Canada ULC",
        "range": "499"
    }, {
        "class_code": "M",
        "make": "Tesla",
        "model": "MODEL 3 Long Range AWD",
        "organization": "Tesla Motors Canada ULC",
        "range": "499"
    }, {
        "class_code": "M",
        "make": "Tesla",
        "model": "MODEL 3 Long Range AWD Performance",
        "organization": "Tesla Motors Canada ULC",
        "range": "499"
    }, {
        "class_code": "L",
        "make": "Tesla",
        "model": "MODEL S 75D",
        "organization": "Tesla Motors Canada ULC",
        "range": "417"
    }, {
        "class_code": "L",
        "make": "Tesla",
        "model": "MODEL S 100D",
        "organization": "Tesla Motors Canada ULC",
        "range": "539"
    }, {
        "class_code": "L",
        "make": "Tesla",
        "model": "MODEL S P100D",
        "organization": "Tesla Motors Canada ULC",
        "range": "507"
    }, {
        "class_code": "L",
        "make": "Tesla",
        "model": "MODEL S Standard Range",
        "organization": "Tesla Motors Canada ULC",
        "range": "459"
    }, {
        "class_code": "L",
        "make": "Tesla",
        "model": "MODEL S Long Range",
        "organization": "Tesla Motors Canada ULC",
        "range": "595"
    }, {
        "class_code": "L",
        "make": "Tesla",
        "model": 'MODEL S Performance (19" Wheels)',
        "organization": "Tesla Motors Canada ULC",
        "range": "555"
    }, {
        "class_code": "L",
        "make": "Tesla",
        "model": 'MODEL S Performance (21" Wheels)',
        "organization": "Tesla Motors Canada ULC",
        "range": "523"
    }, {
        "class_code": "UL",
        "make": "Tesla",
        "model": "MODEL X 75D",
        "organization": "Tesla Motors Canada ULC",
        "range": "383"
    }, {
        "class_code": "UL",
        "make": "Tesla",
        "model": "MODEL X 100D",
        "organization": "Tesla Motors Canada ULC",
        "range": "475"
    }, {
        "class_code": "UL",
        "make": "Tesla",
        "model": "MODEL X P100D",
        "organization": "Tesla Motors Canada ULC",
        "range": "465"
    }, {
        "class_code": "UL",
        "make": "Tesla",
        "model": "MODEL X Standard Range",
        "organization": "Tesla Motors Canada ULC",
        "range": "410"
    }, {
        "class_code": "UL",
        "make": "Tesla",
        "model": "MODEL X Long Range",
        "organization": "Tesla Motors Canada ULC",
        "range": "523"
    }, {
        "class_code": "UL",
        "make": "Tesla",
        "model": 'MODEL X Performance (20" Wheels)',
        "organization": "Tesla Motors Canada ULC",
        "range": "491"
    }, {
        "class_code": "UL",
        "make": "Tesla",
        "model": 'MODEL X Performance (22" Wheels)',
        "organization": "Tesla Motors Canada ULC",
        "range": "435"
    }, {
        "class_code": "C",
        "make": "Volkswagen",
        "model": "e-GOLF",
        "organization": "Volkswagen Group Canada Inc.",
        "range": "201"
    }]

    def check_run_preconditions(self):
        for veh in self.list_of_vehicles:
            if Vehicle.objects.filter(
                model_year__name='2019', model_name=veh['model']
            ).exists():
                return False

        return True

    @transaction.atomic
    def run(self):
        model_year = ModelYear.objects.get(name="2019")
        vehicle_zev_type = ZevType.objects.get(vehicle_zev_code="BEV")

        vehicles_added = 0

        for vehicle in self.list_of_vehicles:
            Vehicle.objects.create(
                make=vehicle.get("make").upper(),
                model_name=vehicle.get("model"),
                model_year=model_year,
                organization=Organization.objects.get(
                    name=vehicle.get("organization"),
                ),
                range=vehicle.get("range"),
                validation_status="VALIDATED",
                vehicle_class_code=VehicleClass.objects.get(
                    vehicle_class_code=vehicle.get("class_code")
                ),
                vehicle_zev_type=vehicle_zev_type,
                weight_kg=0
            )

            vehicles_added += 1

        print("Added {} vehicles.".format(vehicles_added))


script_class = AddBatteryElectricVehicles

from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear
from api.models.organization import Organization
from api.models.vehicle import Vehicle
from api.models.vehicle_zev_type import ZevType


class AddPluginHybridVehicles(OperationalDataScript):
    """
    Adds the Plug-in hybrid electric vehicles
    """
    is_revertable = False
    comment = 'Adds the Plug-in hybrid electric vehicles'

    list_of_vehicles = [{
        "class_code": "C",
        "make": "BMW",
        "model": "530e",
        "organization": "BMW Canada Inc.",
        "range": "26",
        "zev_type": "PHEV"
    }, {
        "class_code": "C",
        "make": "BMW",
        "model": "530e xDRIVE",
        "organization": "BMW Canada Inc.",
        "range": "24",
        "zev_type": "PHEV"
    }, {
        "class_code": "S",
        "make": "BMW",
        "model": "i3 REx (120 Ah)",
        "organization": "BMW Canada Inc.",
        "range": "203",
        "zev_type": "PHEV"
    }, {
        "class_code": "S",
        "make": "BMW",
        "model": "i3s REx (120 Ah)",
        "organization": "BMW Canada Inc.",
        "range": "203",
        "zev_type": "PHEV"
    }, {
        "class_code": "S",
        "make": "BMW",
        "model": "i8 COUPE",
        "organization": "BMW Canada Inc.",
        "range": "29",
        "zev_type": "PHEV"
    }, {
        "class_code": "S",
        "make": "BMW",
        "model": "i8 ROADSTER",
        "organization": "BMW Canada Inc.",
        "range": "29",
        "zev_type": "PHEV"
    }, {
        "class_code": "C",
        "make": "Chevrolet",
        "model": "VOLT",
        "organization": "FCA Canada Inc.",
        "range": "85",
        "zev_type": "PHEV"
    }, {
        "class_code": "M",
        "make": "Ford",
        "model": "FUSION ENERGI",
        "organization": "Ford Motor Company of Canada Ltd.",
        "range": "42",
        "zev_type": "PHEV"
    }, {
        "class_code": "M",
        "make": "Honda",
        "model": "CLARITY PLUG-IN",
        "organization": "Honda Canada Inc.",
        "range": "77",
        "zev_type": "PHEV"
    }, {
        "class_code": "M",
        "make": "Hyundai",
        "model": "IONIQ ELECTRIC PLUS",
        "organization": "Hyundai Auto Canada Corp.",
        "range": "47",
        "zev_type": "PHEV"
    }, {
        "class_code": "M",
        "make": "Hyundai",
        "model": "SONATA PLUG-IN",
        "organization": "Hyundai Auto Canada Corp.",
        "range": "45",
        "zev_type": "PHEV"
    }, {
        "class_code": "WS",
        "make": "Kia",
        "model": "NIRO PLUG-IN",
        "organization": "Kia Canada Inc.",
        "range": "42",
        "zev_type": "PHEV"
    }, {
        "class_code": "M",
        "make": "Kia",
        "model": "OPTIMA PLUG-IN",
        "organization": "Kia Canada Inc.",
        "range": "47",
        "zev_type": "PHEV"
    }, {
        "class_code": "US",
        "make": "Mercedes-Benz",
        "model": "GLC 350e 4MATIC",
        "organization": "Mercedes-Benz Canada Inc.",
        "range": "21",
        "zev_type": "PHEV"
    }, {
        "class_code": "M",
        "make": "Mini",
        "model": "COOPER S E COUNTRYMAN ALL4",
        "organization": "BMW Canada Inc.",
        "range": "19",
        "zev_type": "PHEV"
    }, {
        "class_code": "US",
        "make": "Mitsubishi",
        "model": "OUTLANDER PHEV AWD",
        "organization": "Mitsubishi Motor Sales of Canada Inc.",
        "range": "35",
        "zev_type": "PHEV"
    }, {
        "class_code": "UL",
        "make": "Porsche",
        "model": "CAYENNE E-HYBRID",
        "organization": "Porsche Cars Canada, Ltd.",
        "range": "21",
        "zev_type": "PHEV"
    }, {
        "class_code": "L",
        "make": "Porsche",
        "model": "PANAMERA 4 E-HYBRID",
        "organization": "Porsche Cars Canada, Ltd.",
        "range": "23",
        "zev_type": "PHEV"
    }, {
        "class_code": "L",
        "make": "Porsche",
        "model": "PANAMERA TURBO S E-HYBRID",
        "organization": "Porsche Cars Canada, Ltd.",
        "range": "23",
        "zev_type": "PHEV"
    }, {
        "class_code": "M",
        "make": "Toyota",
        "model": "PRIUS PRIME",
        "organization": "Toyota Canada Inc.",
        "range": "40",
        "zev_type": "PHEV"
    }, {
        "class_code": "M",
        "make": "Volvo",
        "model": "S90 T8 AWD",
        "organization": "Volvo Car Canada Ltd.",
        "range": "34",
        "zev_type": "PHEV"
    }, {
        "class_code": "US",
        "make": "Volvo",
        "model": "XC60 T8 AWD",
        "organization": "Volvo Car Canada Ltd.",
        "range": "27",
        "zev_type": "PHEV"
    }, {
        "class_code": "UL",
        "make": "Volvo",
        "model": "XC90 T8 AWD",
        "organization": "Volvo Car Canada Ltd.",
        "range": "27",
        "zev_type": "PHEV"
    }]

    def check_run_preconditions(self):
        for vehicle in self.list_of_vehicles:
            if Vehicle.objects.filter(
                model_year__name='2019', model_name=vehicle['model']
            ).exists():
                return False

        return True

    @transaction.atomic
    def run(self):
        model_year = ModelYear.objects.get(name="2019")

        vehicles_added = 0

        for vehicle in self.list_of_vehicles:
            Vehicle.objects.create(
                make=vehicle.get("make"),
                model_name=vehicle.get("model"),
                model_year=model_year,
                organization=Organization.objects.get(
                    name=vehicle.get("organization"),
                ),
                range=vehicle.get("range"),
                validation_status="VALIDATED",
                vehicle_zev_type=ZevType.objects.get(
                    vehicle_zev_code=vehicle.get("zev_type")
                )
            )

            vehicles_added += 1

        print("Added {} vehicles.".format(vehicles_added))


script_class = AddPluginHybridVehicles

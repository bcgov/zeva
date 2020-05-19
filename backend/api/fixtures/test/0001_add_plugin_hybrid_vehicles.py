from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle
from api.models.vehicle_zev_type import ZevType


class AddPluginHybridVehicles(OperationalDataScript):
    """
    Adds the Plug-in hybrid electric vehicles
    """
    is_revertable = False
    comment = 'Adds the Plug-in hybrid electric vehicles'

    list_of_vehicles = [{
        "make": "BMW",
        "model": "530e",
        "zev_type": "PHEV",
        "range": "26",
        "class_code": "C"
    }, {
        "make": "BMW",
        "model": "530e xDRIVE",
        "zev_type": "PHEV",
        "range": "24",
        "class_code": "C"
    }, {
        "make": "BMW",
        "model": "i3 REx (120 Ah)",
        "zev_type": "PHEV",
        "range": "203",
        "class_code": "S"
    }, {
        "make": "BMW",
        "model": "i3s REx (120 Ah)",
        "zev_type": "PHEV",
        "range": "203",
        "class_code": "S"
    }, {
        "make": "BMW",
        "model": "i8 COUPE",
        "zev_type": "PHEV",
        "range": "29",
        "class_code": "S"
    }, {
        "make": "BMW",
        "model": "i8 ROADSTER",
        "zev_type": "PHEV",
        "range": "29",
        "class_code": "S"
    }, {
        "make": "Chevrolet",
        "model": "VOLT",
        "zev_type": "PHEV",
        "range": "85",
        "class_code": "C"
    }, {
        "make": "Ford",
        "model": "FUSION ENERGI",
        "zev_type": "PHEV",
        "range": "42",
        "class_code": "M"
    }, {
        "make": "Honda",
        "model": "CLARITY PLUG-IN",
        "zev_type": "PHEV",
        "range": "77",
        "class_code": "M"
    }, {
        "make": "Hyundai",
        "model": "IONIQ ELECTRIC PLUS",
        "zev_type": "PHEV",
        "range": "47",
        "class_code": "M"
    }, {
        "make": "Hyundai",
        "model": "SONATA PLUG-IN",
        "zev_type": "PHEV",
        "range": "45",
        "class_code": "M"
    }, {
        "make": "Karma",
        "model": "REVERO",
        "zev_type": "PHEV",
        "range": "60",
        "class_code": "S"
    }, {
        "make": "Kia",
        "model": "NIRO PLUG-IN",
        "zev_type": "PHEV",
        "range": "42",
        "class_code": "WS"
    }, {
        "make": "Kia",
        "model": "OPTIMA PLUG-IN",
        "zev_type": "PHEV",
        "range": "47",
        "class_code": "M"
    }, {
        "make": "Mercedes-Benz",
        "model": "GLC 350e 4MATIC",
        "zev_type": "PHEV",
        "range": "21",
        "class_code": "US"
    }, {
        "make": "Mini",
        "model": "COOPER S E COUNTRYMAN ALL4",
        "zev_type": "PHEV",
        "range": "19",
        "class_code": "M"
    }, {
        "make": "Mitsubishi",
        "model": "OUTLANDER PHEV AWD",
        "zev_type": "PHEV",
        "range": "35",
        "class_code": "US"
    }, {
        "make": "Porsche",
        "model": "CAYENNE E-HYBRID",
        "zev_type": "PHEV",
        "range": "21",
        "class_code": "UL"
    }, {
        "make": "Porsche",
        "model": "PANAMERA 4 E-HYBRID",
        "zev_type": "PHEV",
        "range": "23",
        "class_code": "L"
    }, {
        "make": "Porsche",
        "model": "PANAMERA TURBO S E-HYBRID",
        "zev_type": "PHEV",
        "range": "23",
        "class_code": "L"
    }, {
        "make": "Toyota",
        "model": "PRIUS PRIME",
        "zev_type": "PHEV",
        "range": "40",
        "class_code": "M"
    }, {
        "make": "Volvo",
        "model": "S90 T8 AWD",
        "zev_type": "PHEV",
        "range": "34",
        "class_code": "M"
    }, {
        "make": "Volvo",
        "model": "XC60 T8 AWD",
        "zev_type": "PHEV",
        "range": "27",
        "class_code": "US"
    }, {
        "make": "Volvo",
        "model": "XC90 T8 AWD",
        "zev_type": "PHEV",
        "range": "27",
        "class_code": "UL"
    }]

    def check_run_preconditions(self):
        for veh in self.list_of_vehicles:
            if Vehicle.objects.filter(model_year__name='2019', model_name=veh['model']).exists():
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
                range=vehicle.get("range"),
                validation_status="VALIDATED",
                vehicle_zev_type=ZevType.objects.get(
                    vehicle_zev_code=vehicle.get("zev_type")
                )
            )

            vehicles_added += 1

        print("Added {} vehicles.".format(vehicles_added))


script_class = AddPluginHybridVehicles

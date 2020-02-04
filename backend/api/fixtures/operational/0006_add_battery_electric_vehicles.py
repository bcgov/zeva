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
        make = Make.objects.get(name="Audi")
        vehicle_fuel_type = FuelType.objects.get(vehicle_fuel_code="B")

        model = "e-tron 55 QUATTRO"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="329",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )

        make = Make.objects.get(name="BMW")
        model = "i3 (120 Ah)"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="246",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        model = "i3s (120 Ah)"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="246",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="S")
        )

        make = Make.objects.get(name="Chevrolet")
        model = "BOLT EV"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="383",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="WS")
        )

        make = Make.objects.get(name="Hyundai")
        model = "IONIQ ELECTRIC"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="200",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )
        model = "KONA ELECTRIC"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="415",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="US")
        )

        make = Make.objects.get(name="Kia")
        model = "NIRO EV"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="385",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="WS")
        )
        model = "SOUL EV"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="179",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="WS")
        )

        make = Make.objects.get(name="Nissan")
        model = "LEAF (40 kWh)"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="243",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )
        model = "LEAF S PLUS"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="363",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )
        model = "LEAF SV/SL PLUS"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="349",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )

        make = Make.objects.get(name="Smart EQ")
        model = "FORTWO CABRIOLET"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="92",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="T")
        )
        model = "FORTWO COUPE"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="93",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="T")
        )

        make = Make.objects.get(name="Tesla")
        model = "MODEL 3 Standard Range"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="151",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )
        model = "MODEL 3 Standard Range Plus"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="386",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )
        model = "MODEL 3 Mid Range"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="425",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )
        model = "MODEL 3 Long Range"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="499",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )
        model = "MODEL 3 Long Range AWD"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="499",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )
        model = "MODEL 3 Long Range AWD Performance"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="499",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="M")
        )
        model = "MODEL S 75D"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="417",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )
        model = "MODEL S 100D"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="539",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )
        model = "MODEL S P100D"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="507",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )
        model = "MODEL S Standard Range"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="459",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )
        model = "MODEL S Long Range"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="595",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )
        model = 'MODEL S Performance (19" Wheels)'
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="555",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )
        model = 'MODEL S Performance (21" Wheels)'
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="523",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="L")
        )
        model = "MODEL X 75D"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="383",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )
        model = "MODEL X 100D"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="475",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )
        model = "MODEL X P100D"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="465",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )
        model = "MODEL X Standard Range"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="410",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )
        model = "MODEL X Long Range"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="523",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )
        model = 'MODEL X Performance (20" Wheels)'
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="491",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )
        model = 'MODEL X Performance (22" Wheels)'
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="435",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="UL")
        )

        make = Make.objects.get(name="Volkswagen")
        model = "e-GOLF"
        Vehicle.objects.create(
            vehicle_fuel_type=vehicle_fuel_type,
            make=make,
            model_name=model,
            model_year=model_year,
            range="201",
            validation_status="VALIDATED",
            vehicle_class_code=VehicleClass.objects.get(vehicle_class_code="C")
        )


script_class = AddBatteryElectricVehicles

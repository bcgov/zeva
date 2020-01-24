from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.vehicle_make import Make


class AddVehicleMakes(OperationalDataScript):
    """
    Adds the vehicle makes that we can find from the NRCAN document such as
    BMW, Chevrolet, Chrysler, Ford, Honda, Hyundai
    """
    is_revertable = False
    comment = 'Adds the vehicle makes found in the NRCAN document'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        Make.objects.create(
            name="Audi"
        )
        Make.objects.create(
            name="BMW"
        )
        Make.objects.create(
            name="Chevrolet"
        )
        Make.objects.create(
            name="Chrysler"
        )
        Make.objects.create(
            name="Ford"
        )
        Make.objects.create(
            name="Honda"
        )
        Make.objects.create(
            name="Hyundai"
        )
        Make.objects.create(
            name="Jaguar"
        )
        Make.objects.create(
            name="Karma"
        )
        Make.objects.create(
            name="Kia"
        )
        Make.objects.create(
            name="Mercedes-Benz"
        )
        Make.objects.create(
            name="Mini"
        )
        Make.objects.create(
            name="Mitsubishi"
        )
        Make.objects.create(
            name="Nissan"
        )
        Make.objects.create(
            name="Porsche"
        )
        Make.objects.create(
            name="Smart EQ"
        )
        Make.objects.create(
            name="Tesla"
        )
        Make.objects.create(
            name="Toyota"
        )
        Make.objects.create(
            name="Volkswagen"
        )
        Make.objects.create(
            name="Volvo"
        )


script_class = AddVehicleMakes

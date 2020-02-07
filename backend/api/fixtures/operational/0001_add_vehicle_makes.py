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
        list_of_makes = [
            "Aston Martin", "Audi", "BMW", "Chevrolet", "Chrysler",
            "Ferrari", "Fiat", "Ford", "GMC", "Honda", "Hyundai", "Isuzu",
            "Jaguar", "Karma", "Kia", "Mazda", "Mercedes-Benz", "Mini",
            "Mitsubishi", "Nissan", "Porsche", "Smart EQ", "Subaru", "Suzuki",
            "Tesla", "Toyota", "Volkswagen", "Volvo"
        ]

        makes_added = 0

        for make_name in list_of_makes:
            (_, created) = Make.objects.get_or_create(
                name=make_name
            )

            if created:
                makes_added += 1

        print("Added {} Vehicles Makes.".format(makes_added))


script_class = AddVehicleMakes

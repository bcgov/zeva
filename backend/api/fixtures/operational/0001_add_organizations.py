from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization


class AddOrganizations(OperationalDataScript):
    """
    Adds other organizations we can find from the NRCAN document such as
    BMW, Chevrolet, Chrysler, Ford, Honda, Hyundai
    """
    is_revertable = False
    comment = 'Adds the organizations found in the NRCAN document'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        Organization.objects.create(
            name="Audi",
            is_government=False
        )
        Organization.objects.create(
            name="BMW",
            is_government=False
        )
        Organization.objects.create(
            name="Chevrolet",
            is_government=False
        )
        Organization.objects.create(
            name="Chrysler",
            is_government=False
        )
        Organization.objects.create(
            name="Ford",
            is_government=False
        )
        Organization.objects.create(
            name="Honda",
            is_government=False
        )
        Organization.objects.create(
            name="Hyundai",
            is_government=False
        )
        Organization.objects.create(
            name="Jaguar",
            is_government=False
        )
        Organization.objects.create(
            name="Karma",
            is_government=False
        )
        Organization.objects.create(
            name="Kia",
            is_government=False
        )
        Organization.objects.create(
            name="Mercedes-Benz",
            is_government=False
        )
        Organization.objects.create(
            name="Mini",
            is_government=False
        )
        Organization.objects.create(
            name="Mitsubishi",
            is_government=False
        )
        Organization.objects.create(
            name="Nissan",
            is_government=False
        )
        Organization.objects.create(
            name="Porsche",
            is_government=False
        )
        Organization.objects.create(
            name="Smart EQ",
            is_government=False
        )
        Organization.objects.create(
            name="Tesla",
            is_government=False
        )
        Organization.objects.create(
            name="Toyota",
            is_government=False
        )
        Organization.objects.create(
            name="Volkswagen",
            is_government=False
        )
        Organization.objects.create(
            name="Volvo",
            is_government=False
        )
        

script_class = AddOrganizations

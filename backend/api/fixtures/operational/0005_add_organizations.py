from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization
from api.models.vehicle_make import Make
from api.models.vehicle_make_organization import VehicleMakeOrganization


class AddOrganizations(OperationalDataScript):
    """
    Adds the known suppliers
    """
    is_revertable = False
    comment = 'Adds the known suppliers from the consumer reports'

    list_of_organizations = [{
        "name": "BMW Canada Inc.",
        "makes": ["BMW"]
    }, {
        "name": "FCA Canada Inc.",
        "makes": ["Chrysler", "Fiat"]
    }, {
        "name": "Ford Motor Company of Canada Ltd.",
        "makes": ["Ford"]
    }, {
        "name": "General Motors of Canada Company",
        "makes": ["GMC"]
    }, {
        "name": "Honda Canada Inc.",
        "makes": ["Honda"]
    }, {
        "name": "Hyundai Auto Canada Corp.",
        "makes": ["Hyundai"]
    }, {
        "name": "Jaguar Land Rover Canada ULC",
        "makes": ["Jaguar"]
    }, {
        "name": "Kia Canada Inc.",
        "makes": ["Kia"]
    }, {
        "name": "Mazda Canada Inc.",
        "makes": ["Mazda"]
    }, {
        "name": "Mercedes-Benz Canada Inc.",
        "makes": ["Mercedes-Benz"]
    }, {
        "name": "Mitsubishi Motor Sales of Canada Inc.",
        "makes": ["Mitsubishi"]
    }, {
        "name": "Nissan Canada Inc.",
        "makes": ["Nissan"]
    }, {
        "name": "Porsche Cars Canada, Ltd.",
        "makes": ["Porsche"]
    }, {
        "name": "Subaru Canada Inc.",
        "makes": ["Subaru"]
    }, {
        "name": "Suzuki",
        "makes": ["Suzuki"]
    }, {
        "name": "Tesla Motors Canada ULC",
        "makes": ["Tesla"]
    }, {
        "name": "Toyota Canada Inc.",
        "makes": ["Toyota"]
    }, {
        "name": "Volkswagen Group Canada Inc.",
        "makes": ["Volkswagen"]
    }, {
        "name": "Volvo Car Canada Ltd.",
        "makes": ["Volvo"]
    }]


    def check_run_preconditions(self):
        for org in self.list_of_organizations:
            if Organization.objects.filter(name=org['name']).exists():
                return False

        return True

    @transaction.atomic
    def run(self):

        organizations_added = 0

        for organization in self.list_of_organizations:
            organization_name = organization.get("name")
            (organization_model, created) = Organization.objects.get_or_create(
                name=organization_name,
                defaults={
                    'is_active': True,
                    'is_government': False
                }
            )

            if created:
                organizations_added += 1

            list_of_makes = organization.get("makes")

            for make_name in list_of_makes:
                (make, _) = Make.objects.get_or_create(name=make_name)

                VehicleMakeOrganization.objects.get_or_create(
                    organization=organization_model,
                    vehicle_make=make
                )

        print("Added {} organizations.".format(organizations_added))


script_class = AddOrganizations

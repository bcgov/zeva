from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization


class AddOrganizations(OperationalDataScript):
    """
    Adds the known suppliers
    """
    is_revertable = False
    comment = 'Adds the known suppliers from the consumer reports'

    list_of_organizations = [{
        "name": "BMW Canada Inc."
    }, {
        "name": "FCA Canada Inc."
    }, {
        "name": "Ford Motor Company of Canada Ltd."
    }, {
        "name": "General Motors of Canada Company"
    }, {
        "name": "Honda Canada Inc."
    }, {
        "name": "Hyundai Auto Canada Corp."
    }, {
        "name": "Jaguar Land Rover Canada ULC"
    }, {
        "name": "Kia Canada Inc."
    }, {
        "name": "Mazda Canada Inc."
    }, {
        "name": "Mercedes-Benz Canada Inc."
    }, {
        "name": "Mitsubishi Motor Sales of Canada Inc."
    }, {
        "name": "Nissan Canada Inc."
    }, {
        "name": "Porsche Cars Canada, Ltd."
    }, {
        "name": "Subaru Canada Inc."
    }, {
        "name": "Suzuki"
    }, {
        "name": "Tesla Motors Canada ULC"
    }, {
        "name": "Toyota Canada Inc."
    }, {
        "name": "Volkswagen Group Canada Inc."
    }, {
        "name": "Volvo Car Canada Ltd."
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

        print("Added {} organizations.".format(organizations_added))


script_class = AddOrganizations

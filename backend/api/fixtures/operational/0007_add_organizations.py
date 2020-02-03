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

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        list_of_organizations = [{
            "name": "Aston Martin",
            "makes": ["Aston Martin"]
        }, {
            "name": "BMW Canada Inc.",
            "makes": ["BMW"]
        }, {
            "name": "FCA Canada Inc.",
            "makes": ["Chrysler", "Fiat"]
        }, {
            "name": "Ferrari",
            "makes": ["Ferrari"]
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
            "name": "Hyundai Canada Inc.",
            "makes": ["Hyundai"]
        }, {
            "name": "Isuzu Commercial Truck of Canada Inc.",
            "makes": ["Isuzu"]
        }, {
            "name": "Jaguar Land Rover Canada ULC",
            "makes": ["Jaguar"]
        }, {
            "name": "Mazda Canada Inc.",
            "makes": ["Mazda"]
        }, {
            "name": "McLaren Automotive Inc.",
            "makes": []
        }, {
            "name": "Mercedes-Benz Canada Inc.",
            "makes": ["Mercedes-Benz"]
        }, {
            "name": "Renault-Nissan-Mitsubishi Alliance",
            "makes": ["Mitsubishi", "Nissan"]
        }, {
            "name": "Renault-Nissan-Mitsubishi Alliance",
            "makes": ["Mitsubishi", "Nissan"]
        }, {
            "name": "Pagani",
            "makes": []
        }, {
            "name": "PSA",
            "makes": []
        }, {
            "name": "Subaru Canada Inc.",
            "makes": ["Subaru"]
        }, {
            "name": "Suzuki",
            "makes": ["Suzuki"]
        }, {
            "name": "Tesla Canada GP Inc.",
            "makes": ["Tesla"]
        }, {
            "name": "Toyota Canada Inc.",
            "makes": ["Toyota"]
        }, {
            "name": "Volkswagen Group Canada Inc.",
            "makes": ["Porsche", "Volkswageen"]
        }, {
            "name": "Volvo Car Canada Ltd.",
            "makes": ["Volvo"]
        }]

        organizations_added = 0

        for organization in list_of_organizations:
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

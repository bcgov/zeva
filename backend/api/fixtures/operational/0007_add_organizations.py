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
        organization = Organization.objects.create(
            name="BMW Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="BMW")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Mercedes-Benz Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Mercedes-Benz")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="FCA Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Chrysler")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )
        (make, _created) = Make.objects.get_or_create(name="Fiat")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Ford Motor Company of Canada Ltd.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Ford")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="General Motors of Canada Company",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="GMC")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Honda Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Honda")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Hyundai Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Hyundai")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Mazda Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Mazda")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Renault-Nissan-Mitsubishi Alliance",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Mitsubishi")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        (make, _created) = Make.objects.get_or_create(name="Nissan")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )
        organization = Organization.objects.create(
            name="PSA",
            is_active=True,
            is_government=False
        )  # no makes yet for PSA

        organization = Organization.objects.create(
            name="Subaru Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Subaru")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Suzuki",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Suzuki")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Jaguar Land Rover Canada ULC",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Jaguar")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Tesla Canada GP Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Tesla")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Toyota Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Toyota")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Volkswagen Group Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Volkswagen")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )
        (make, _created) = Make.objects.get_or_create(name="Porsche")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Volvo Car Canada Ltd.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Volvo")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Ferrari",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Ferrari")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )
        organization = Organization.objects.create(
            name="Aston Martin",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Aston Martin")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="McLaren Automotive Inc.",
            is_active=True,
            is_government=False
        )  # no makes yet for Mclaren

        organization = Organization.objects.create(
            name="Isuzu Commercial Truck of Canada Inc.",
            is_active=True,
            is_government=False
        )
        (make, _created) = Make.objects.get_or_create(name="Isuzu")
        VehicleMakeOrganization.objects.create(
            organization=organization,
            vehicle_make=make
        )

        organization = Organization.objects.create(
            name="Pagani",
            is_active=True,
            is_government=False
        )  # no makes yet for Pagani


script_class = AddOrganizations

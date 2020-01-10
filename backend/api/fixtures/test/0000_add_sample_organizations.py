from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization
from api.models.organization_address import OrganizationAddress


class AddSampleOrganizations(OperationalDataScript):
    """
    Adds a couple of organizations as sample data
    """
    is_revertable = False
    comment = 'Adds Sample Organizations'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        mitsubishi = Organization.objects.create(
            name="Mitsubishi Motors",
            is_government=False
        )

        honda = Organization.objects.create(
            name="Honda Motor Company, Ltd",
            is_government=False
        )

        tesla = Organization.objects.create(
            name="Tesla, Inc.",
            is_government=False
        )

        _toyota = Organization.objects.create(
            name="Toyota Motor Corporation",
            is_government=False
        )

        ford = Organization.objects.create(
            name="Ford Motor Company",
            is_government=False
        )

        volkswagen = Organization.objects.create(
            name="Volkswagen",
            is_government=False
        )

        OrganizationAddress.objects.create(
            address_line_1="3-1, Marunouchi 2-Chome, Chiyoda-ku",
            city="Tokyo",
            country="Japan",
            effective_date="2020-01-08",
            organization=mitsubishi,
            postal_code="100-8086"
        )

        OrganizationAddress.objects.create(
            address_line_1="2-1-1 Minami-Aoyama, Minato-ku",
            city="Tokyo",
            country="Japan",
            effective_date="2020-01-08",
            organization=honda,
            postal_code="107-8556"
        )

        OrganizationAddress.objects.create(
            city="Palo Alto",
            country="United States",
            effective_date="2020-01-08",
            organization=tesla,
            state="California"
        )

        OrganizationAddress.objects.create(
            city="Dearborn",
            country="United States",
            effective_date="2020-01-08",
            organization=ford,
            state="Michigan"
        )

        OrganizationAddress.objects.create(
            country="Germany",
            effective_date="2020-01-08",
            organization=volkswagen
        )


script_class = AddSampleOrganizations

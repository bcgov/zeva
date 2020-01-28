from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization


class AddGovernmentOrganization(OperationalDataScript):
    """
    Adds the Government of British Columbia as an organization
    and mark them as 'government'
    """
    is_revertable = False
    comment = 'Adds Government Organization'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        Organization.objects.create(
            name="Government of British Columbia",
            is_active=True,
            is_government=True
        )


script_class = AddGovernmentOrganization

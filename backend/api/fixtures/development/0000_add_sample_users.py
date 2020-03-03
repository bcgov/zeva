from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization
from api.models.organization_address import OrganizationAddress
from api.models.user_profile import UserProfile


class AddSampleUsers(OperationalDataScript):
    """
    Adds a couple of users as sample data
    """
    is_revertable = False
    comment = 'Adds Sample Users'

    def check_run_preconditions(self):
        return not UserProfile.objects.filter(username='fs1').exists()

    @transaction.atomic
    def run(self):

        fs1 = Organization.objects.get(
            name="Suzuki"
        )

        fs2 = Organization.objects.get(
            name="Toyota Canada Inc."
        )

        gov = Organization.objects.get(
            name="Government of British Columbia"
        )

        vs1 = UserProfile.objects.create(username='fs1', is_active=True, organization=fs1)
        vs2 = UserProfile.objects.create(username='fs2', is_active=True, organization=fs2)
        analyst = UserProfile.objects.create(username='analyst', is_active=True, organization=gov)


script_class = AddSampleUsers

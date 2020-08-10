from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization
from api.models.user_profile import UserProfile


class AddUsers(OperationalDataScript):
    """
    Adds test users for functional testing
    """
    is_revertable = False
    comment = 'Adds users for functional testing'

    list_of_users = [{
        "first_name": "Test",
        "last_name": "Bceid",
        "display_name": "Test Bceid",
        "username": "TEST_BCEID",
        "organization": Organization.objects.get(
            name="Tesla Motors Canada ULC"
        ).id
    }, {
        "first_name": "Test",
        "last_name": "Idir",
        "display_name": "Test Idir",
        "username": "TEST_IDIR",
        "organization": Organization.objects.get(
            name="Government of British Columbia"
        ).id
    }]

    def check_run_preconditions(self):
        for user in self.list_of_users:
            if UserProfile.objects.filter(username=user['username']):
                return False

        return True

    @transaction.atomic
    def run(self):
        users_added = 0

        for user in self.list_of_users:
            (_, created) = UserProfile.objects.get_or_create(
                first_name=user.get("first_name"),
                last_name=user.get("last_name"),
                organization_id=user.get("organization"),
                username=user.get("username"),
                defaults={
                    "is_active": True,
                    "display_name": user.get("display_name")
                }
            )

            if created:
                users_added += 1

        print("Added {} Users.".format(users_added))


script_class = AddUsers

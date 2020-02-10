from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization
from api.models.user_profile import UserProfile


class AddUsers(OperationalDataScript):
    """
    Adds 'us' into the UserProfile table
    """
    is_revertable = False
    comment = 'Adds the vehicle makes found in the NRCAN document'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        list_of_users = [{
            "first_name": "Alasdair",
            "last_name": "Ring",
            "display_name": "Alasdair Ring",
            "username": "ARING"
        }, {
            "first_name": "Emily",
            "last_name": "Hillier",
            "display_name": "Emily Hillier",
            "username": "EMHILLIE"
        }, {
            "first_name": "James",
            "last_name": "Donald",
            "display_name": "James Donald",
            "username": "JADONALD"
        }, {
            "first_name": "Katie",
            "last_name": "Menke",
            "display_name": "Katie Menke",
            "username": "KMENKE"
        }, {
            "first_name": "Kristin",
            "last_name": "Lefler",
            "display_name": "Kristin Lefler",
            "username": "KLEFLER"
        }, {
            "first_name": "Kuan",
            "last_name": "Fan",
            "display_name": "Kuan Fan",
            "username": "KFAN"
        }, {
            "first_name": "Richard",
            "last_name": "Tan",
            "display_name": "Richard Tan",
            "username": "RTAN"
        }, {
            "first_name": "Robert ",
            "last_name": "Johnstone",
            "display_name": "Robert Johnstone",
            "username": "RJOHNSTONE"
        }]

        organization = Organization.objects.get(
            name="Government of British Columbia"
        )

        users_added = 0

        for user in list_of_users:
            (_, created) = UserProfile.objects.get_or_create(
                first_name=user.get("first_name"),
                last_name=user.get("last_name"),
                organization=organization,
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

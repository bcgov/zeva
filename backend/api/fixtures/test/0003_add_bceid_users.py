from django.db import transaction
import random

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization
from api.models.user_profile import UserProfile


class AddBCEIDUsers(OperationalDataScript):
    """
    Adds 'us' as BCEID users into the UserProfile table
    """
    is_revertable = False
    comment = 'Adds the vehicle makes found in the NRCAN document'

    list_of_users = [{
        "first_name": "Alasdair",
        "last_name": "Ring",
        "display_name": "Alasdair Ring",
        "username": "ARING_BCEID",
        "keycloak_user_id": "ARING_BCEID"
    }, {
        "first_name": "Emily",
        "last_name": "Hillier",
        "display_name": "Emily Hillier",
        "username": "EMHILLIE_BCEID",
        "keycloak_user_id": "EMHILLIE_BCEID"
    }, {
        "first_name": "James",
        "last_name": "Donald",
        "display_name": "James Donald",
        "username": "JADONALD_BCEID",
        "keycloak_user_id": "JADONALD_BCEID"
    }, {
        "first_name": "Katie",
        "last_name": "Menke",
        "display_name": "Katie Menke",
        "username": "KMENKE_BCEID",
        "keycloak_user_id": "KMENKE_BCEID"
    }, {
        "first_name": "Kristin",
        "last_name": "Lefler",
        "display_name": "Kristin Lefler",
        "username": "KLEFLER_BCEID",
        "keycloak_user_id": "KLEFLER_BCEID"
    }, {
        "first_name": "Kuan",
        "last_name": "Fan",
        "display_name": "Kuan Fan",
        "username": "KFAN_BCEID",
        "keycloak_user_id": "KFAN_BCEID"
    }, {
        "first_name": "Richard",
        "last_name": "Tan",
        "display_name": "Richard Tan",
        "username": "RTAN_BCEID",
        "keycloak_user_id": "RTAN_BCEID"
    }, {
        "first_name": "Anton",
        "last_name": "Coetzer",
        "display_name": "Anton Coetzer",
        "username": "ALCOETZE_BCEID",
        "keycloak_user_id": "ALCOETZE_BCEID"
    }]

    def check_run_preconditions(self):
        for user in self.list_of_users:
            if UserProfile.objects.filter(username=user['username']):
                return False

        return True

    @transaction.atomic
    def run(self):
        organizations = list(Organization.objects.filter(
            is_government=False,
            is_active=True
        ))

        num_users = len(self.list_of_users)
        if len(organizations) < num_users:
            num_to_create = num_users - len(organizations)
            for i in range(num_to_create):
                new_org = Organization.objects.create(
                    name=f"Random Organization {i}-{random.randint(1, 10000)}",
                    is_government=False,
                    is_active=True,
                )
                organizations.append(new_org)

        random.shuffle(organizations)
        users_added = 0

        for i, user in enumerate(self.list_of_users):
            organization = organizations[i]
            _, created = UserProfile.objects.get_or_create(
                first_name=user.get("first_name"),
                last_name=user.get("last_name"),
                organization=organization,
                username=user.get("username"),
                keycloak_user_id=user.get("keycloak_user_id"),
                defaults={
                    "is_active": True,
                    "display_name": user.get("display_name")
                }
            )

            if created:
                users_added += 1

        print("Added {} BCEID Users.".format(users_added))

script_class = AddBCEIDUsers

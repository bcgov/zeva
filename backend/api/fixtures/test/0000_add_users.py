from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.organization import Organization
from api.models.user_profile import UserProfile


class AddUsers(OperationalDataScript):
    """
    Adds 'us' into the UserProfile table
    """
    is_revertable = False
    comment = 'Adds test users'

    list_of_users = [{
        "first_name": "Alasdair",
        "last_name": "Ring",
        "display_name": "Alasdair Ring",
        "username": "AIRING",
        "email": "alasdair.ring@gov.bc.ca",
        "keycloak_email": "alasdair.ring@gov.bc.ca",
        "keycloak_user_id": "AIRING"
    }, {
        "first_name": "Emily",
        "last_name": "Hillier",
        "display_name": "Emily Hillier",
        "username": "EMHILLIE",
        "email": "emily.hillier@gov.bc.ca",
        "keycloak_email": "emily.hillier@gov.bc.ca",
        "keycloak_user_id": "EMHILLIE"
    }, {
        "first_name": "James",
        "last_name": "Donald",
        "display_name": "James Donald",
        "username": "JADONALD",
        "email": "james.donald@gov.bc.ca",
        "keycloak_email": "james.donald@gov.bc.ca",
        "keycloak_user_id": "JADONALD"
    }, {
        "first_name": "Katie",
        "last_name": "Menke",
        "display_name": "Katie Menke",
        "username": "KMENKE",
        "email": "katie.menke@gov.bc.ca",
        "keycloak_email": "katie.menke@gov.bc.ca",
        "keycloak_user_id": "KMENKE"
    }, {
        "first_name": "Kristin",
        "last_name": "Lefler",
        "display_name": "Kristin Lefler",
        "username": "KLEFLER",
        "email": "kristin.lefler@gov.bc.ca",
        "keycloak_email": "kristin.lefler@gov.bc.ca",
        "keycloak_user_id": "KLEFLER"
    }, {
        "first_name": "Kuan",
        "last_name": "Fan",
        "display_name": "Kuan Fan",
        "username": "KFAN",
        "email": "kuan.fan@gov.bc.ca",
        "keycloak_email": "kuan.fan@gov.bc.ca",
        "keycloak_user_id": "KFAN"
    }, {
        "first_name": "Richard",
        "last_name": "Tan",
        "display_name": "Richard Tan",
        "username": "RTAN",
        "email": "richard.tan@gov.bc.ca",
        "keycloak_email": "richard.tan@gov.bc.ca",
        "keycloak_user_id": "RTAN"
    }, {
        "first_name": "Anton",
        "last_name": "Coetzer",
        "display_name": "Anton Coetzer",
        "username": "ALCOETZE",
        "email": "anton.coetzer@gov.bc.ca",
        "keycloak_email": "anton.coetzer@gov.bc.ca",
        "keycloak_user_id": "ALCOETZE"
    }, {
        "first_name": "Navpreet",
        "last_name": "Grewal",
        "display_name": "Navpreet Grewal",
        "username": "NXGREWAL",
        "email": "Navpreet.X.Grewal@gov.bc.ca",
        "keycloak_email": "Navpreet.X.Grewal@gov.bc.ca",
        "keycloak_user_id": "NXGREWAL"
    }, {
        "first_name": "Molly",
        "last_name": "Pilchar",
        "display_name": "Molly Pilchar",
        "username": "MPILCHAR",
        "email": "molly.pilchar@gov.bc.ca",
        "keycloak_email": "molly.pilchar@gov.bc.ca",
        "keycloak_user_id": "MPILCHAR"
    }]

    def check_run_preconditions(self):
        for user in self.list_of_users:
            if UserProfile.objects.filter(username=user['username']):
                return False

        return True

    @transaction.atomic
    def run(self):

        organization = Organization.objects.get(
            name="Government of British Columbia"
        )

        users_added = 0

        for user in self.list_of_users:
            (_, created) = UserProfile.objects.get_or_create(
                first_name=user.get("first_name"),
                last_name=user.get("last_name"),
                organization=organization,
                username=user.get("username"),
                email=user.get("email"),
                keycloak_email=user.get("keycloak_email"),
                keycloak_user_id=user.get("keycloak_user_id"),
                defaults={
                    "is_active": True,
                    "display_name": user.get("display_name")
                }
            )

            if created:
                users_added += 1

        print("Added {} Users.".format(users_added))


script_class = AddUsers

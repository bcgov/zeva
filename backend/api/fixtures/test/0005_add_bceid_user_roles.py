from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.role import Role
from api.models.user_profile import UserProfile
from api.models.user_role import UserRole


class AddBCEIDUserRoles(OperationalDataScript):
    """
    Gives our test accounts (bceid) user roles so we can do something in the system
    """
    is_revertable = False
    comment = 'Adds bceid user roles'

    list_of_users = [
        "RTAN_BCEID"
    ]

    list_of_roles = [
        "Organization Administrator", "Signing Authority", "Manage ZEV"
    ]

    def check_run_preconditions(self):
        for username in self.list_of_users:
            if UserRole.objects.filter(
                user_profile__username=username
            ).exists():
                return False

        return True

    @transaction.atomic
    def run(self):
        user_roles_added = 0

        for username in self.list_of_users:
            user_profile = UserProfile.objects.filter(
                username=username
            ).first()

            if user_profile is None:
                continue

            for role_code in self.list_of_roles:
                role = Role.objects.get(
                    role_code=role_code
                )

                (_, created) = UserRole.objects.get_or_create(
                    role=role,
                    user_profile=user_profile,
                    defaults={
                        'create_user': 'SYSTEM'
                    }
                )

                if created:
                    user_roles_added += 1

        print("Added {} user roles.".format(user_roles_added))


script_class = AddBCEIDUserRoles

from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.permission import Permission
from api.models.role import Role
from api.models.role_permission import RolePermission
from api.authorities import REQUIRED_AUTHORITIES


class AddRolesPermissions(OperationalDataScript):
    """
    Adds the Roles and Permissions
    """
    is_revertable = False
    comment = 'Adds the Roles and Permissions in the authorities file'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        display_order = 1
        roles_added = 0
        permissions_added = 0

        for authority in REQUIRED_AUTHORITIES:
            if authority.root is None:
                continue

            (role, role_created) = Role.objects.get_or_create(
                role_code=authority.group,
                defaults={
                    'description': authority.group,
                    'is_government_role':
                        True if authority.root == 'IDIR' else False,
                    'display_order': display_order
                }
            )

            (permission, perm_created) = Permission.objects.get_or_create(
                permission_code=authority.role.replace(' ', '_').upper(),
                defaults={
                    'name': authority.role,
                    'description': authority.description
                }
            )

            RolePermission.objects.get_or_create(
                permission=permission,
                role=role
            )

            if role_created:
                roles_added += 1
                display_order += 1

            if perm_created:
                permissions_added += 1

        print("Added {} roles.".format(roles_added))
        print("Added {} permissions.".format(permissions_added))


script_class = AddRolesPermissions

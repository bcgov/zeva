from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.permission import Permission
from api.models.role import Role
from api.models.role_permission import RolePermission
from api.authorities import REQUIRED_AUTHORITIES


class UpdateRolesPermissions(OperationalDataScript):
    """
    Adds the Roles and Permissions
    """
    is_revertable = False
    comment = 'Updates the permissions for the roles so that they make more ' \
              'sense with application.' 

    def check_run_preconditions(self):
        return True

    def update_analyst(self):

        role = Role.objects.get(
            role_code="ZEVA User"
        )

        permissions_to_be_added = [
            'CREATE_COMPLIANCE_REPORTS',
        ]

        for permission_code in permissions_to_be_added:
            permission = Permission.objects.get(permission_code=permission_code)
            RolePermission.objects.get_or_create(
                permission=permission,
                role=role
            )

    @transaction.atomic
    def run(self):
        self.update_analyst()

        print('Updated Permissions')


script_class = UpdateRolesPermissions

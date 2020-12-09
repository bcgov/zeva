from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.permission import Permission
from api.models.role import Role
from api.models.role_permission import RolePermission


class UpdateRolesPermissions(OperationalDataScript):
    """
    Adds the Roles and Permissions
    """
    is_revertable = False
    comment = 'Adds the view credit transfers permissions for ZEV users and ' \
              'signing authorities.' 

    def check_run_preconditions(self):
        return True

    def update_zeva_user(self):
        permissions_to_be_added = [
            'VIEW_CREDIT_TRANSFERS',
        ]

        role = Role.objects.get(
            role_code="ZEVA User"
        )

        for permission_code in permissions_to_be_added:
            permission = Permission.objects.get(permission_code=permission_code)
            RolePermission.objects.get_or_create(
                permission=permission,
                role=role
            )

    def update_signing_authority(self):
        permissions_to_be_added = [
            'VIEW_CREDIT_TRANSFERS',
        ]

        role = Role.objects.get(
            role_code="Signing Authority"
        )

        for permission_code in permissions_to_be_added:
            permission = Permission.objects.get(permission_code=permission_code)
            RolePermission.objects.get_or_create(
                permission=permission,
                role=role
            )

    @transaction.atomic
    def run(self):
        self.update_zeva_user()
        self.update_signing_authority()

        print('Updated Permissions')


script_class = UpdateRolesPermissions

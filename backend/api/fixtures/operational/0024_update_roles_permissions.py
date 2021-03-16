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
    comment = 'Adds new permission' 

    def check_run_preconditions(self):
        return True

    def update_permissions(self):
        Permission.objects.get_or_create(
            permission_code="VIEW_BCEID_NOTIFICATIONS",
            defaults={
                'name': "View BceID Notifications",
                'description': "can view notification list for BCEID"
            }
        )

    def update_signing_authority(self):
        permissions_to_be_added = [
            'VIEW_BCEID_NOTIFICATIONS'
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

    def update_zeva_user(self):
        permissions_to_be_added = [
            'VIEW_BCEID_NOTIFICATIONS'
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

    @transaction.atomic
    def run(self):
        self.update_permissions()
        self.update_zeva_user()
        self.update_signing_authority()

        print('Updated Permissions')


script_class = UpdateRolesPermissions

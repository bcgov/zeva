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

    def update_permissions(self):
        Permission.objects.get_or_create(
            permission_code="REQUEST_ZEV_CHANGES",
            defaults={
                'name': "Request Zev Model Changes",
                'description': "can request changes to submitted zev models"
            }
        )

        Permission.objects.get_or_create(
            permission_code="EDIT_ICBC_DATA",
            defaults={
                'name': "Update ICBC Data",
                'description': "can upload new ICBC registration data"
            }
        )

        Permission.objects.get_or_create(
            permission_code="REJECT_CREDIT_TRANSFER",
            name="Reject Credit Transfer",
            description="Can reject credit transfers"
        )

        Permission.objects.get_or_create(
            permission_code="VALIDATE_SALES",
            defaults={
                'name': "Validate Sales",
                'description': "can check the uploaded sales data against icbc data"
            }
        )

        Permission.objects.get_or_create(
            permission_code="VALIDATE_SALES",
            defaults={
                'name': "Validate Sales",
                'description': "can check the uploaded sales data against icbc data"
            }
        )

        Permission.objects.get_or_create(
            permission_code="VIEW_CREDIT_TRANSACTIONS",
            defaults={
                'name': "View Credit Transactions",
                'description': "can view the credit transactions/balance of "
                               "the organization"
            }
        )

        permission = Permission.objects.get(
            permission_code="CREATE_CREDIT_TRANSFER"
        )

        permission.permission_code = 'CREATE_CREDIT_TRANSFERS'
        permission.save()

    def update_analyst(self):
        permissions_to_be_deleted = [
            'CREATE_CREDIT_TRANSFERS',
            'CREATE_SALES',
            'CREATE_ZEV',
            'EDIT_CREDIT_TRANSFERS',
            'EDIT_SALES',
            'EDIT_ZEV',
            'DELETE_CREDIT_TRANSFERS',
            'DELETE_SALES',
            'DELETE_ZEV',
        ]

        role = Role.objects.get(
            role_code="Engineer/Analyst"
        )

        RolePermission.objects.filter(
            permission__permission_code__in=permissions_to_be_deleted,
            role=role
        ).delete()

        permissions_to_be_added = [
            'EDIT_ICBC_DATA',
            'REQUEST_ZEV_CHANGES',
            'VALIDATE_SALES',
            'VIEW_ORGANIZATIONS',
        ]

        for permission_code in permissions_to_be_added:
            permission = Permission.objects.get(permission_code=permission_code)
            RolePermission.objects.get_or_create(
                permission=permission,
                role=role
            )

    def update_director(self):
        permissions_to_be_added = [
            'REJECT_CREDIT_TRANSFER'
        ]

        role = Role.objects.get(
            role_code="Director"
        )

        for permission_code in permissions_to_be_added:
            permission = Permission.objects.get(permission_code=permission_code)
            RolePermission.objects.get_or_create(
                permission=permission,
                role=role
            )

    def update_organization_administrator(self):
        permissions_to_be_added = [
            'VIEW_SALES'
        ]

        role = Role.objects.get(
            role_code="Organization Administrator"
        )

        for permission_code in permissions_to_be_added:
            permission = Permission.objects.get(permission_code=permission_code)
            RolePermission.objects.get_or_create(
                permission=permission,
                role=role
            )

    def update_signing_authority(self):
        permissions_to_be_added = [
            'EDIT_CREDIT_TRANSFERS',
            'EDIT_SALES',
            'VIEW_CREDIT_TRANSACTIONS',
            'VIEW_SALES'
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

    def update_manage_zev(self):
        permissions_to_be_added = [
            'CREATE_CREDIT_TRANSFERS',
            'CREATE_SALES',
            'DELETE_CREDIT_TRANSFERS',
            'EDIT_SALES',
            'VIEW_CREDIT_TRANSACTIONS',
            'VIEW_SALES'
        ]

        role = Role.objects.get(
            role_code="Manage ZEV"
        )

        for permission_code in permissions_to_be_added:
            permission = Permission.objects.get(permission_code=permission_code)
            RolePermission.objects.get_or_create(
                permission=permission,
                role=role
            )

        role.role_code = "ZEVA User"
        role.description = "ZEVA User"
        role.save()

    @transaction.atomic
    def run(self):
        self.update_permissions()
        self.update_analyst()
        self.update_director()
        self.update_manage_zev()
        self.update_organization_administrator()
        self.update_signing_authority()

        print('Updated Permissions')


script_class = UpdateRolesPermissions

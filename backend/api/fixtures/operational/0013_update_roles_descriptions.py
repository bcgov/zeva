from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.role import Role


class UpdateRolesDescriptions(OperationalDataScript):
    """
    Adds the Roles and Permissions
    """
    is_revertable = False
    comment = 'Updates the role descriptions'

    def check_run_preconditions(self):
        return True
    def update_roles(self):
        role = Role.objects.get(role_code="Administrator")
        role.description = "can add and manage IDIR users and assign roles"
        role.save()
        role = Role.objects.get(role_code="Director")
        role.description = "can provide statutory decisions to issue, record and/or approve Credit Applications and Transfers"
        role.save()
        role = Role.objects.get(role_code="Engineer/Analyst")
        role.description = "can add new auto suppliers and BCEID users, validate new ZEV Models; upload ICBC data, analyse and recommend issuance of Credit Applications and Transfers"
        role.save()
        role = Role.objects.get(role_code="Organization Administrator")
        role.description = "can add and manage BCEID users and assign roles"
        role.save()
        role = Role.objects.get(role_code="Signing Authority")
        role.description = "can sign-off and submit Credit Applications and Transfers to government"
        role.save()
        role = Role.objects.get(role_code="ZEVA User")
        role.description = "can submit new ZEV Models and create Credit Applications and Transfers"
        role.save()

    @transaction.atomic
    def run(self):
        self.update_roles()


script_class = UpdateRolesDescriptions

from django.db import models
from auditable.models import Auditable
from api.managers.permission import PermissionManager


class Permission(Auditable):
    """
    Contains the list of permissions to grant access to certain actions of
    areas for the system.
    """
    permission_code = models.CharField(
        max_length=100,
        unique=True,
        db_comment="Permission code. Natural key."
    )
    name = models.CharField(
        max_length=100,
        db_comment="Short description of the permission."
                   "eg User Management, View Credit Transactions, Sign a "
                   "Credit Transfer Proposal, etc"
    )
    description = models.CharField(
        max_length=1000,
        db_comment="More detailed description of the permission."
    )

    objects = PermissionManager()

    def natural_key(self):
        """
        Allows code to be used to identify a row in the table.
        """
        return (self.code,)

    class Meta:
        db_table = 'permission'

    db_table_comment = "Contains the list of permissions to grant access to " \
                       "certain actions of areas for the system."

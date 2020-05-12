from django.db import models

from auditable.models import Auditable
from api.managers.role import RoleManager

from .permission import Permission


class Role(Auditable):
    """
    Table that will hold all the available Roles and descriptions
    """
    name = models.CharField(
        max_length=200,
        unique=True,
        db_comment="Role code. Natural key. Used internally."
                   "eg Admin, GovUser, GovDirector, etc"
    )

    description = models.CharField(
        max_length=1000,
        db_comment="Descriptive text explaining this role. "
                   "This is what's shown to the user."
    )

    is_government_role = models.BooleanField(
        default=False,
        db_comment="Flag. True if this is a government role "
                   "(eg. Analyst, Administrator)"
    )

    display_order = models.IntegerField(
        db_comment="Relative rank in display sorting order"
    )

    default_role = models.BooleanField(
        default=False,
        db_comment="Flag. True if this will be a default role "
                   "applied to a user if the user doesn't have "
                   "any other roles."
    )

    @property
    def permissions(self):
        """
        Permissions associated with the Role
        """
        permissions = Permission.objects.filter(
            role_permissions__role_id=self.id
        ).distinct()

        return permissions

    objects = RoleManager()

    def natural_key(self):
        """
        Allows us to match with the role name
        """
        return (self.name,)

    # Add effective_date and expiration_date
    class Meta:
        db_table = 'role'

    db_table_comment = "Table that will hold all the available Roles " \
                       "and descriptions."

from django.db import models

from auditable.models import Auditable


class RolePermission(Auditable):
    """
    Relationship table between the roles and permissions.
    (ie what roles contain what permissions)
    """
    role = models.ForeignKey(
        'Role',
        related_name='role_permissions',
        on_delete=models.CASCADE)
    permission = models.ForeignKey(
        'Permission',
        related_name='role_permissions',
        on_delete=models.CASCADE)

    class Meta:
        db_table = 'role_permission'

    db_table_comment = "Relationship table between the roles and " \
                       "permissions." \
                       "(ie what roles contain what permissions)"

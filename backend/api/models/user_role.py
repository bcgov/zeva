from django.db import models

from auditable.models import Auditable


class UserRole(Auditable):
    """
    Contains the relationship between the user and roles table.
    (ie what roles do the users have)
    """
    user_profile = models.ForeignKey(
        'UserProfile',
        related_name='user_roles',
        on_delete=models.CASCADE
    )
    role = models.ForeignKey(
        'Role',
        related_name='user_roles',
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'user_role'

    db_table_comment = "Contains the relationship between the user and " \
                       "roles table." \
                       "(ie what roles do the users have)"

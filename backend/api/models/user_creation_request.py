from django.db import models

from auditable.models import Auditable


class UserCreationRequest(Auditable):
    """
    Contains a list of users that were created by the system.
    This is used to map out the relationship between the email used via
    keycloak and the actual user in the system.
    """
    keycloak_email = models.EmailField(
        blank=False,
        null=False,
        db_comment="Keycloak email address to associate on first login."
    )
    external_username = models.CharField(
        blank=True,
        max_length=150,
        null=True,
        db_comment="BCeID or IDIR username"
    )
    user_profile = models.OneToOneField(
        'UserProfile',
        related_name='creation_request',
        on_delete=models.PROTECT,
        unique=True,
        db_comment="The user to be associated with a Keycloak account."
    )
    is_mapped = models.BooleanField(
        default=False,
        db_comment="True if this request has been acted on"
    )

    class Meta:
        db_table = 'user_creation_request'
        unique_together = (('keycloak_email', 'external_username'),)

    db_table_comment = "Contains a list of users that were created by the " \
                       "system. " \
                       "This is used to map out the relationship between " \
                       "the email used via keycloak and the actual user in " \
                       "the system."

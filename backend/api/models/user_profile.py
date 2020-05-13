import string

from django.db import models
from django.db.models import F, Q
import django.contrib.auth.validators

from auditable.models import Auditable

from api.managers.user_profile import UserProfileManager
from api.models.role import Role


class UserProfile(Auditable):
    """
    User Model
    """
    display_name = models.CharField(
        blank=True,
        max_length=500,
        null=True,
        db_comment="Display Name (retrieved from Keycloak)"
    )
    first_name = models.CharField(
        blank=True,
        max_length=50,
        null=True,
        db_comment="First name (retrieved from Keycloak)"
    )
    last_name = models.CharField(
        blank=True,
        max_length=50,
        null=True,
        db_comment="Last name (retrieved from Keycloak)"
    )
    email = models.EmailField(
        blank=True,
        null=True,
        db_comment="Primary email address"
    )
    is_active = models.BooleanField(
        default=False,
        db_comment="Boolean Field to see if the user should be able to login."
    )
    organization = models.ForeignKey(
        'Organization',
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )
    phone = models.CharField(
        blank=True,
        max_length=50,
        null=True,
        db_comment="Primary phone number"
    )
    title = models.CharField(
        blank=True,
        max_length=100,
        null=True,
        db_comment="Professional Title"
    )
    username = models.CharField(
        max_length=130,
        unique=True,
        db_comment="Username that we can connect the user to Keycloak."
    )
    keycloak_email = models.EmailField(
        blank=True,
        null=True,
        db_comment="BCEID/IDIR Email Address"
    )

    def has_role(self, role: string):
        return role in self.roles

    objects = UserProfileManager()

    @property
    def is_government(self):
        """
        Boolean to indicate whether user is an IDIR user.
        (User is a BCEID user if false)
        """
        return self.organization.is_government

    @property
    def roles(self):
        """
        Roles applied to the User
        """
        return Role.objects.filter(user_roles__user_profile_id=self.id)

    class Meta:
        db_table = 'user_profile'

    db_table_comment = "Users who may access the application"

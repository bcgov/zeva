from django.db import models
from django.db.models import F, Q
import django.contrib.auth.validators

from auditable.models import Auditable

from api.managers.user_profile import UserProfileManager


class UserProfile(Auditable):
    """
    User Model
    """
    display_name = models.CharField(
        blank=True,
        max_length=500,
        null=True,
        db_comment="Display Name (retrieved from Siteminder)"
    )
    first_name = models.CharField(
        blank=True,
        max_length=50,
        null=True,
        db_comment="First name (retrieved from Siteminder)"
    )
    last_name = models.CharField(
        blank=True,
        max_length=50,
        null=True,
        db_comment="Last name (retrieved from Siteminder)"
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
    ),
    username = models.CharField(
        max_length=130,
        db_comment="Username that we can connect the user to Keycloak."
    )

    objects = UserProfileManager()

    class Meta:
        db_table = 'user_profile'

    db_table_comment = "Users who may access the application"

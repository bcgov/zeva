from django.db import models
from django.db.models import Q

from auditable.models import Auditable

from api.managers.user_profile import UserProfileManager
from api.models.permission import Permission
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
    keycloak_user_id = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        db_comment="This is the unique id returned from Keycloak and is the main" +
          " mapping key between the TFRS user and the Keycloak user. The identity" +
          " provider type will be appended as a suffix after an @ symbol. For ex." +
          " asdf1234@bceidbasic or asdf1234@idir"
    )

    objects = UserProfileManager()

    def has_perm(self, permission):
        """
        Helper function to check if the user has the appropriate permission
        """
        if not self.roles.filter(
                Q(role_permissions__permission__permission_code=permission)):
            return False

        return True

    @property
    def is_government(self):
        """
        Boolean to indicate whether user is an IDIR user.
        (User is a BCEID user if false)
        """
        return self.organization.is_government

    @property
    def permissions(self):
        """
        Permissions that the user has based on the roles applied
        """
        return Permission.objects.distinct().filter(
            Q(role_permissions__role__in=self.roles)
        ).order_by('id')

    @property
    def roles(self):
        """
        Roles applied to the User
        """
        return Role.objects.filter(user_roles__user_profile_id=self.id)

    class Meta:
        db_table = 'user_profile'

    db_table_comment = "Users who may access the application"

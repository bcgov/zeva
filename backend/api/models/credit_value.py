from datetime import date
from django.db import models
from django.db.models import F

from auditable.models import Auditable
from .mixins.Named import UniquelyNamed
from .organization_address import OrganizationAddress
from .user_profile import UserProfile
from ..managers.organization import OrganizationManager


class CreditValue(Auditable):

    class Meta:
        db_table = 'credits'

    a = models.DecimalField(null=True, blank=False, decimal_places=3, max_digits=5)
    b = models.DecimalField(null=True, blank=False, decimal_places=3, max_digits=5)

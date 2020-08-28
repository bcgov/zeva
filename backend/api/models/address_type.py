"""
Address Type model
"""
from django.db import models

from api.models.mixins.effective_dates import EffectiveDates
from auditable.models import Auditable


class AddressType(EffectiveDates, Auditable):
    """
    A lookup table for address type.
    Can be either records or service addresses.
    """
    class Meta:
        db_table = "address_type"

    address_type = models.CharField(
        blank=False,
        db_comment="Address Type",
        max_length=20,
        null=False,
        unique=True
    )

    db_table_comment = "A lookup table for address type./"
    "Can be either records or service addresses"

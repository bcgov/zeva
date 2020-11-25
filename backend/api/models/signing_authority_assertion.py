from enum import Enum

from django.db import models

from api.models.mixins.display_order import DisplayOrder
from api.models.mixins.effective_dates import EffectiveDates
from auditable.models import Auditable


class SigningAuthorityAssertion(Auditable, DisplayOrder, EffectiveDates):
    class AssertionModules(Enum):
        """
        List of possible modules for the assertion
        """
        CREDIT_TRANSFER = "credit_transfer"

    description = models.CharField(
        max_length=4000,
        blank=True,
        null=True,
        db_comment="Description of the signing authority assertion statement. "
                   "This is the displayed name."
    )

    module = models.CharField(
        choices=[(d, d.name) for d in AssertionModules],
        default="credit_transfer",
        max_length=50,
        blank=False,
        null=False,
        db_comment="Module that uses the assertion."
                   "e.g. Credit Transfer"
    )

    class Meta:
        db_table = 'signing_authority_assertion'

    db_table_comment = "Contains a list of valid regulatory statements that " \
                       "must be confirmed or certified by the officer or " \
                       "employee of the vehicle supplier."

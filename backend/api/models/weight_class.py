"""
Weight Class model
"""
from django.db import models

from api.models.mixins.effective_dates import EffectiveDates
from auditable.models import Auditable


class WeightClass(EffectiveDates, Auditable):
    """
    A lookup table for weight classes. Initially, LDV only,
    but with room to expand later.
    """
    class Meta:
        db_table = "weight_class_code"

    weight_class_code = models.CharField(
        blank=False,
        db_comment="Weight Class (eg LDV for Light-weight Vehicle)",
        max_length=3,
        null=False,
        unique=True
    )

    db_table_comment = "A lookup table for weight classes." \
                       "Initially, LDV only, room to expand later."

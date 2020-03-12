from django.db import models

from api.models.mixins.effective_dates import EffectiveDates

class CreditClass(EffectiveDates):
    class Meta:
        db_table = "credit_class"

    credit_class = models.CharField(
        blank=False,
        db_comment="Credit Class (eg A, B)",
        max_length=3,
        null=False,
        unique=True,
        primary_key=True
    )

    db_table_comment = "A lookup table for credit classes. Initially, A or B, " \
                       "but with room to expand later."

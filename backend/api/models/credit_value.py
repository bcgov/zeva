from datetime import date
from django.db import models

from auditable.models import Auditable


class CreditValue(Auditable):
    class_a_credit_value = models.DecimalField(
        blank=False,
        decimal_places=3,
        max_digits=5,
        null=True,
        db_comment="Credit value to use if the Vehicle is an A Class."
    )
    class_b_credit_value = models.DecimalField(
        blank=False,
        decimal_places=3,
        max_digits=5,
        null=True,
        db_comment="Credit value to use if the Vehicle is a B Class."
    )

    class Meta:
        db_table = 'credit_value'

    db_table_comment = "List of credit values that are assigned to a vehicle"

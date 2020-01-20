from django.db import models

from auditable.models import Auditable


class Vehicle(Auditable):
    make = models.ForeignKey(
        'Make',
        related_name=None,
        on_delete=models.PROTECT
    )

    model = models.ForeignKey(
        'Model',
        related_name=None,
        on_delete=models.PROTECT
    )

    trim = models.ForeignKey(
        'Trim',
        related_name=None,
        on_delete=models.PROTECT
    )

    type = models.ForeignKey(
        'Type',
        related_name=None,
        on_delete=models.PROTECT
    )

    range = models.IntegerField(
        db_comment='Vehicle Range in km'
    )

    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )

    is_validated = models.BooleanField(
        default=False,
        db_comment="Whether this vehicle has been an accepted ZEV "
                   "by the regulator."
    )

    credit_value = models.OneToOneField(
        'CreditValue',
        on_delete=models.CASCADE, null=True
    )

    class Meta:
        db_table = 'vehicle'
        unique_together = [['make', 'model', 'trim', 'model_year']]

    db_table_comment = "List of credit-generating vehicle definitions"

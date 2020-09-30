from django.db import models

from auditable.models import Auditable


class CreditTransferContent(Auditable):
    """
    Contains the rows for the credit transfer.
    """
    credit_transfer = models.ForeignKey(
        'CreditTransfer',
        related_name='credit_transfer_content',
        on_delete=models.CASCADE
    )
    dollar_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Value per credit in dollars'
    )
    credit_class = models.ForeignKey(
        'CreditClass',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    credit_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Amount of credits being transferred'
    )
    weight_class = models.ForeignKey(
        'WeightClass',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )

    class Meta:
        db_table = 'credit_transfer_content'

    db_table_comment = \
        "Contains the rows for the credit transfer."

"""
Credit Transfer Comment Model
"""
from django.db import models

from auditable.models import Auditable


class CreditTransferComment(Auditable):
    """
    Contains comments made about the Credit Transfer between
    director and analyst (idir only)
    """
    credit_transfer = models.ForeignKey(
        'CreditTransfer',
        related_name='credit_transfer_comments',
        null=False,
        on_delete=models.PROTECT
    )
    comment = models.CharField(
        max_length=4000,
        blank=True,
        null=True,
        db_column='credit_transfer_comment',
        db_comment="Comment left by supplier about sale"
    )

    class Meta:
        db_table = 'credit_transfer_comment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains comments made about the Credit Transfer"\
            "from receiving partner to seller"

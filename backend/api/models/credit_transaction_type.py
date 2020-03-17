from django.db import models

from auditable.models import Auditable


class CreditTransactionType(Auditable):

    transaction_type = models.CharField(
        blank=False,
        db_comment="Transaction Type (eg Trade, Reduction, Grant)",
        max_length=20,
        null=False,
        unique=True,
        primary_key=True
    )

    class Meta:
        db_table = "credit_transaction_type"

    db_table_comment = "A lookup table for credit transaction types, since credits may " \
                       "be generated for multiple reasons"

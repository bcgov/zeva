from django.db import models

from auditable.models import Auditable


class CreditTransaction(Auditable):
    credit_to = models.ForeignKey(
        'Organization',
        related_name='credit_transactions',
        on_delete=models.PROTECT,
        null=True  # could be NULL if this is not a trade
    )
    debit_from = models.ForeignKey(
        'Organization',
        related_name='debit_transactions',
        on_delete=models.PROTECT,
        null=True  # could be NULL if this is not a trade
    )
    credit_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='The number of credits transferred'
    )
    credit_class = models.ForeignKey(
        'CreditClass',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )
    transaction_type = models.ForeignKey(
        'CreditTransactionType',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )
    transaction_timestamp = models.DateTimeField(
        blank=False,
        null=False,
        auto_now_add=True,
        db_comment="The timestamp at which the transaction was recorded"
    )
    vehicle = models.ForeignKey(
        'Vehicle',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )

    class Meta:
        db_table = "credit_transaction"

    db_table_comment = "A ledger of all recorded credit transactions from any source. " \
                       "Additionally used to calculate current balance."

"""
Credit Transaction Model
"""
from django.db import models

from auditable.models import Auditable


class CreditTransaction(Auditable):
    """
    A ledger of all recorded credit transactions from
    any source. Additionally used to calculate current
    balance.
    """
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
        db_comment='Credit value of the model when the submission was '
                   'approved. For credit transfers, this will be the amount '
                   'that is going to be added or subtracted from the '
                   'organization. (since it supports decimals)'
    )
    number_of_credits = models.IntegerField(
        db_comment='Number of credits being transferred. For credit transfers '
                   'this will always be 1.'
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
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    weight_class = models.ForeignKey(
        'WeightClass',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )
    total_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='calculated field: number of credits x credit value'
    )

    def get_total_value(self):
        """
        Gets the total value of the credits
        """
        return self.number_of_credits * self.credit_value

    class Meta:
        db_table = "credit_transaction"

    db_table_comment = "A ledger of all recorded credit transactions from " \
                       "any source. Additionally used to calculate current " \
                       "balance."

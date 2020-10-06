from django.db import models

from auditable.models import Auditable


class CreditTransferCreditTransaction(Auditable):
    """
    Contains the relationship between the credit transfer and
    credit transactions table.
    """
    credit_transfer = models.ForeignKey(
        'CreditTransfer',
        related_name='credit_transfer_credit_transaction',
        on_delete=models.CASCADE
    )
    credit_transaction = models.ForeignKey(
        'CreditTransaction',
        related_name='credit_transfer_credit_transaction',
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'credit_transfer_credit_transaction'

    db_table_comment = \
        "Contains the relationship between the credit_transfer and " \
        "credit transactions table."

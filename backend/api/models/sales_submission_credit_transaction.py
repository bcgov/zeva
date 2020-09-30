from django.db import models

from auditable.models import Auditable


class SalesSubmissionCreditTransaction(Auditable):
    """
    Contains the relationship between the sales submission and
    credit transactions table.
    """
    sales_submission = models.ForeignKey(
        'SalesSubmission',
        related_name='sales_submission_credit_transaction',
        on_delete=models.CASCADE
    )
    credit_transaction = models.ForeignKey(
        'CreditTransaction',
        related_name='sales_submission_credit_transaction',
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'sales_submission_credit_transaction'

    db_table_comment = \
        "Contains the relationship between the sales_submission and " \
        "credit transactions table."

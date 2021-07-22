from django.db import models

from auditable.models import Auditable


class CreditAgreementCreditTransaction(Auditable):
    """
    Contains the relationship between the credit agreement and
    credit transactions table.
    """
    credit_agreement = models.ForeignKey(
        'CreditAgreement',
        related_name='credit_agreement_credit_transaction',
        on_delete=models.CASCADE
    )
    credit_transaction = models.ForeignKey(
        'CreditTransaction',
        related_name='credit_agreement_credit_transaction',
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'credit_agreement_credit_transaction'

    db_table_comment = \
        "Contains the relationship between the credit agreement and " \
        "credit transactions table."

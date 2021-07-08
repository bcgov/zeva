"""
Credit Agreement Content
"""
from django.db import models

from auditable.models import Auditable


class CreditAgreementContent(Auditable):
    """
    Credit details for Credit Agreement Report.
    """
    credit_agreement = models.ForeignKey(
        'CreditAgreement',
        null=False,
        related_name='credit_agreement_content',
        on_delete=models.PROTECT
    )
    credit_class = models.ForeignKey(
        'CreditClass',
        related_name='credit_agreement_content',
        on_delete=models.PROTECT,
        null=False
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name='credit_agreement_content',
        on_delete=models.PROTECT,
        null=False
    )
    number_of_credits = models.IntegerField(
        db_comment="Number of credits."
    )
    
    class Meta:
        db_table = 'credit_agreement_content'

    db_table_comment = "Credit details for Credit Agreement Report."

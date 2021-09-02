"""
Credit Agreement Comment Model
"""
from django.db import models

from auditable.models import Auditable


class CreditAgreementComment(Auditable):
    """
    Contains comments made about the Credit Agreement
    """
    credit_agreement = models.ForeignKey(
        'CreditAgreement',
        null=False,
        related_name='credit_agreement_comment',
        on_delete=models.PROTECT
    )
    to_director = models.BooleanField(
        default=False,
        db_comment="determines if comment is meant for director"
    )
    comment = models.CharField(
        max_length=4000,
        blank=True,
        null=True,
        db_comment="Comment left by idir user about credit agreement"
    )

    class Meta:
        db_table = 'credit_agreement_comment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains comments made about the Credit Agreement"\
        "from analyst to director and from director to supplier"

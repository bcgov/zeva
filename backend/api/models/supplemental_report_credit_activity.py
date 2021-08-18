"""
Supplemental Report Credit Activity Model
"""
from django.db import models

from auditable.models import Auditable


class SupplementalReportCreditActivity(Auditable):
    """
    Table to record credit
    activity information for the supplemental report
    """
    supplemental_report = models.ForeignKey(
        'SupplementalReport',
        related_name='supplemental_report_credit_activity',
        on_delete=models.PROTECT,
        null=False
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=True
    )
    credit_a_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Value of credit A',
        null=True
    )
    credit_b_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Value of credit B',
        null=True
    )
    category = models.CharField(
        blank=True,
        max_length=100,
        null=True,
        db_comment="Category (eg. CREDIT_BALANCE_START. CREDITS_ISSUED_ZEV_SALES, CREDITS_IN, CREDITS_OUT, CREDIT_BALANCE_END, CREDIT_BALANCE_END, CREDIT_BALANCE_PROVISIONAL)"
    )

    class Meta:
        db_table = 'supplemental_report_credit_activity'

    db_table_comment = "Table to record credit activity" \
                       "information for the supplemental report"

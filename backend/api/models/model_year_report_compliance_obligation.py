"""
Model Year Report Compliance Obligation
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportComplianceObligation(Auditable):
    """
    Table to record compliance obligation and credit
    activity information for the model year report
    """
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='model_year_report_compliance_obligation',
        on_delete=models.DO_NOTHING
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
    )
    credit_a_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Value of credit A'
    )
    credit_b_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Value of credit B'
    )
    reduction_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Reduction value',
        blank=True,
        null=True,
    )
    category = models.CharField(
        blank=True,
        max_length=100,
        null=True,
        db_comment="Category (eg. CREDIT_BALANCE_START. CREDITS_ISSUED_ZEV_SALES, CREDITS_IN, CREDITS_OUT, CREDIT_BALANCE_END, CREDIT_BALANCE_END, CREDIT_BALANCE_PROVISIONAL)"
    )

    from_gov = models.BooleanField(
        default=False,
        db_comment="Flag. True if this edit came from a government user."
    )

    class Meta:
        db_table = 'model_year_report_compliance_obligation'

    db_table_comment = "Table to record compliance obligation and credit" \
                       "activity information for the model year report"

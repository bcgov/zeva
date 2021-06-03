"""
Model Year Report Adjustment
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportAdjustment(Auditable):
    """
    Adjustments that the government user is making to the report.
    """
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='model_year_report_adjustments',
        on_delete=models.PROTECT
    )
    credit_class = models.ForeignKey(
        'CreditClass',
        related_name='model_year_report_adjustments',
        on_delete=models.PROTECT,
        null=False
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name='model_year_report_adjustments',
        on_delete=models.PROTECT,
        null=False
    )
    number_of_credits = models.IntegerField(
        db_comment="Number of credits that the report is being adjusted to."
    )
    is_reduction = models.BooleanField(
        default=False,
        db_comment="Flag. True if it's a reduction. Otherwise, it's an "
                   "allocation "
    )

    class Meta:
        db_table = 'model_year_report_adjustment'

    db_table_comment = "Adjustments that the government user is making to " \
                       "the report."

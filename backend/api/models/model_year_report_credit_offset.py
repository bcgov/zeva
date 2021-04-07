"""
Model Year Report Credit Offset
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportCreditOffset(Auditable):
    """
    Table to store credit offset for the obligation and credit
    activity for the model year report
    """
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='model_year_report_credit_offset',
        on_delete=models.DO_NOTHING
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
    )
    credit_a_offset_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Value of credit A offset'
    )
    credit_b_offset_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Value of credit B offset'
    )

    class Meta:
        db_table = 'model_year_report_credit_offset'

    db_table_comment = "Table to store credit offset values for the " \
                       "obligation and credit activity for the model year report"

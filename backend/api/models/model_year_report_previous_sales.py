"""
Model Year Report Previous Sales
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportPreviousSales(Auditable):
    """
    Table to store previous years LDV Sales/Leases
    """

    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    previous_sales = models.IntegerField(
        blank=False,
        db_comment="Containes the previous years LDV sales/leases data based on model year."
    )
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )

    class Meta:
        db_table = "model_year_report_previous_sales"

    db_table_comment = "Table to store previous years LDV Sales/Leases"
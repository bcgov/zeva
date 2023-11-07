"""
Model Year Report LDV Sales
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportLDVSales(Auditable):
    """
    Table to store LDV Sales/Leases by year
    """

    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    ldv_sales = models.IntegerField(
        blank=False,
        db_comment="Contains the LDV sales/leases data based on model year."
    )
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    from_gov = models.BooleanField(
        default=False,
        db_comment="Flag. True if this edit came from a government user."
    )
    display = models.BooleanField(
        default=True,
        db_comment="field to determine if we should display this info"
    )

    class Meta:
        db_table = "model_year_report_ldv_sales"

    db_table_comment = "Table to store LDV Sales/Leases by year"

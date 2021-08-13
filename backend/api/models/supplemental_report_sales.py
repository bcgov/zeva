"""
Supplemental Report ZEV Sales Model
"""
from django.db import models

from auditable.models import Auditable


class SupplementalReportSales(Auditable):
    """
    Table containes ZEV vehicle sales information based on supplemental report
    """

    supplemental_report = models.ForeignKey(
        'SupplementalReport',
        related_name='supplemental_report_sales',
        on_delete=models.PROTECT,
        null=False
    )
    sales = models.IntegerField(
        db_comment="Sum of issued sales for zev models",
        null=True
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=True
    )
    make = models.CharField(
        blank=True,
        db_comment="Make of vehicle",
        max_length=250,
        null=True
    )
    model_name = models.CharField(
        blank=True,
        db_comment="Model of vehicle",
        max_length=250,
        null=True
    )
    vehicle_zev_type = models.ForeignKey(
        'ZevType',
        related_name=None,
        on_delete=models.PROTECT,
        null=True
    )
    range = models.DecimalField(
        blank=True,
        decimal_places=2,
        max_digits=20,
        db_comment="vehicle range in km"
    )
    zev_class = models.ForeignKey(
        'CreditClass',
        related_name=None,
        on_delete=models.PROTECT,
        null=True
    )
    model_year_report_vehicle = models.ForeignKey(
        'ModelYearReportVehicle',
        related_name=None,
        on_delete=models.PROTECT,
        null=True
    )


    class Meta:
        db_table = "supplemental_report_sales"

    db_table_comment = "Table containes ZEV vehicle sales"\
                       "information based on supplemental report"

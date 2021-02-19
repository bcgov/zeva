"""
Model Year Report Vehicle
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportVehicle(Auditable):
    """
    Table to store ZEV vehicle information based on model year
    """
    pending_sales = models.IntegerField(
        db_comment="Sum of pending sales for zev models"
    )
    sales_issued = models.IntegerField(
        db_comment="Sum of issued sales for zev models"
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    make = models.CharField(
        blank=False,
        db_comment="Make of vehicle",
        max_length=250,
        null=False
    )
    model_name = models.CharField(
        blank=False,
        db_comment="Model of vehicle",
        max_length=250,
        null=False
    )
    vehicle_zev_type = models.ForeignKey(
        'ZevType',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    range = models.DecimalField(
        blank=False,
        decimal_places=2,
        max_digits=20,
        db_comment="vehicle range in km"
    )
    zev_class = models.ForeignKey(
        'CreditClass',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )

    class Meta:
        db_table = "model_year_report_vehicle"

    db_table_comment = "Table to store ZEV vehicle information based on model year"

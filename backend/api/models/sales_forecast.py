from django.db import models
from api.models.model_year_report import ModelYearReport
from auditable.models import Auditable


class SalesForecast(Auditable):
    model_year_report = models.ForeignKey(
        to=ModelYearReport, unique=True, on_delete=models.DO_NOTHING
    )

    ice_vehicles_one = models.IntegerField(blank=True, null=True)

    ice_vehicles_two = models.IntegerField(blank=True, null=True)

    ice_vehicles_three = models.IntegerField(blank=True, null=True)

    zev_vehicles_one = models.IntegerField(blank=True, null=True)

    zev_vehicles_two = models.IntegerField(blank=True, null=True)

    zev_vehicles_three = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = "sales_forecast"

    db_table_comment = "Stores sales forecast information"

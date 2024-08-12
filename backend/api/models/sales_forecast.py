from django.db import models
from django.db.models import Q
from api.models.model_year_report import ModelYearReport
from auditable.models import Auditable


class SalesForecast(Auditable):
    model_year_report = models.ForeignKey(
        to=ModelYearReport, on_delete=models.DO_NOTHING
    )

    active = models.BooleanField(default=True)

    ice_vehicles_one = models.IntegerField()

    ice_vehicles_two = models.IntegerField()

    ice_vehicles_three = models.IntegerField()

    zev_vehicles_one = models.IntegerField()

    zev_vehicles_two = models.IntegerField()

    zev_vehicles_three = models.IntegerField()

    class Meta:
        db_table = "sales_forecast"
        constraints = [
            models.UniqueConstraint(
                fields=["model_year_report"],
                condition=Q(active=True),
                name="unique_to_myr_active_forecasts",
            )
        ]

    db_table_comment = "Stores sales forecast information"

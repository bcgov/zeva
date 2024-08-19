from django.db import models
from enumfields import EnumField
from api.models.sales_forecast import SalesForecast
from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass
from api.constants.zev_type import ZEV_TYPE
from auditable.models import Auditable


class SalesForecastRecord(Auditable):
    sales_forecast = models.ForeignKey(to=SalesForecast, on_delete=models.CASCADE)

    model_year = models.CharField(max_length=4)

    make = models.CharField(max_length=250)

    model_name = models.CharField(max_length=250)

    type = EnumField(ZEV_TYPE)

    range = models.DecimalField(max_digits=20, decimal_places=2)

    zev_class = models.CharField(max_length=1)

    interior_volume = models.DecimalField(max_digits=20, decimal_places=2)

    total_sales = models.IntegerField()

    class Meta:
        db_table = "sales_forecast_record"

    db_table_comment = "Stores sales forecast records"

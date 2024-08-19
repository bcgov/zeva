from rest_framework.serializers import ModelSerializer, SlugRelatedField
from enumfields.drf import EnumField
from api.models.sales_forecast import SalesForecast
from api.models.sales_forecast_record import SalesForecastRecord
from api.constants.zev_type import ZEV_TYPE


class SalesForecastSerializer(ModelSerializer):
    class Meta:
        model = SalesForecast
        fields = [
            "ice_vehicles_one",
            "ice_vehicles_two",
            "ice_vehicles_three",
            "zev_vehicles_one",
            "zev_vehicles_two",
            "zev_vehicles_three",
        ]


class SalesForecastRecordSerializer(ModelSerializer):
    type = EnumField(ZEV_TYPE)

    class Meta:
        model = SalesForecastRecord
        fields = [
            "model_year",
            "make",
            "model_name",
            "type",
            "range",
            "zev_class",
            "interior_volume",
            "total_supplied",
        ]

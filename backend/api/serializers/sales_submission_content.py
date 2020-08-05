from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.sales_submission_content import SalesSubmissionContent
from api.serializers.vehicle import VehicleMinSerializer
from api.services.sales_spreadsheet import get_date


class SalesSubmissionContentSerializer(ModelSerializer):
    sales_date = SerializerMethodField()
    vehicle = SerializerMethodField()

    def get_sales_date(self, instance):
        return get_date(
            instance.xls_sale_date,
            instance.xls_date_type,
            instance.xls_date_mode
        )

    def get_vehicle(self, instance):
        serializer = VehicleMinSerializer(instance.vehicle, read_only=True)

        return serializer.data

    class Meta:
        model = SalesSubmissionContent
        fields = (
            'sales_date', 'vehicle', 'xls_make', 'xls_model',
            'xls_model_year', 'xls_vin',
        )
        read_only_fields = (
            'id',
        )

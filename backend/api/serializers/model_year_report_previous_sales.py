from rest_framework.serializers import ModelSerializer
from api.serializers.model_year_report import ModelYearReportSerializer
from api.serializers.vehicle import ModelYearSerializer

from api.models.model_year_report_previous_sales import ModelYearReportPreviousSales


class ModelYearReportPreviousSalesSerializer(ModelSerializer):  
    model_year = ModelYearSerializer()
    model_year_report = ModelYearReportSerializer

    class Meta:
        model = ModelYearReportPreviousSales
        fields = (
            'id', 'previous_sales', 'model_year', 'model_year_report',
        )

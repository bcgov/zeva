from rest_framework.serializers import ModelSerializer

from api.models.model_year_report_previous_sales import ModelYearReportPreviousSales


class ModelYearReportPreviousSalesSerializer(ModelSerializer):
    
    class Meta:
        model = ModelYearReportPreviousSales
        fields = (
            'id', 'previous_sales', 'model_year_id', 'model_year_report_id',
        )

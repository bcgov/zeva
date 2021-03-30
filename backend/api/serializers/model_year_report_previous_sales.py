from rest_framework.serializers import ModelSerializer, SlugRelatedField
from api.serializers.model_year_report import ModelYearReportSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.models.model_year import ModelYear

from api.models.model_year_report_previous_sales import \
     ModelYearReportPreviousSales


class ModelYearReportPreviousSalesSerializer(ModelSerializer):
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    model_year_report = ModelYearReportSerializer

    class Meta:
        model = ModelYearReportPreviousSales
        fields = (
            'id', 'previous_sales', 'model_year',
        )

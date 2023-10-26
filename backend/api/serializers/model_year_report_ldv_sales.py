from rest_framework.serializers import ModelSerializer, SlugRelatedField
# from api.serializers.model_year_report import ModelYearReportSerializer
from api.models.model_year import ModelYear

from api.models.model_year_report_ldv_sales import \
     ModelYearReportLDVSales


class ModelYearReportLDVSalesSerializer(ModelSerializer):
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    # model_year_report = ModelYearReportSerializer

    class Meta:
        model = ModelYearReportLDVSales
        fields = (
            'id', 'ldv_sales', 'model_year'
        )

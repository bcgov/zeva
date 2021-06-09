from rest_framework.serializers import ModelSerializer

from api.models.model_year_report_make import ModelYearReportMake


class ModelYearReportMakeSerializer(ModelSerializer):
    class Meta:
        model = ModelYearReportMake
        fields = (
            'make', 'from_gov'
        )

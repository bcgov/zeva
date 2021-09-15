from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_statuses import ModelYearReportStatuses


class ModelYearReportNoaSerializer(ModelSerializer):
    validation_status = SerializerMethodField()

    def get_validation_status(self, obj):
        if obj.validation_status in [
            ModelYearReportStatuses.ASSESSED,
            ModelYearReportStatuses.REASSESSED
        ]:
            return obj.get_validation_status_display()

    class Meta:
        model = ModelYearReportHistory
        fields = (
            'update_timestamp', 'validation_status', 'id',
        )

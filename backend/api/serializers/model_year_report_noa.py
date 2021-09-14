from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_history import ModelYearReportHistory


class ModelYearReportNoaSerializer(ModelSerializer):
    validation_status = SerializerMethodField()

    def get_validation_status(self, obj):
        # request = self.context.get('request')
        # if not request.user.is_government and obj.validation_status in [
        #     ModelYearReportStatuses.RECOMMENDED,
        #     ModelYearReportStatuses.RETURNED]:
        #     return ModelYearReportStatuses.SUBMITTED.value
        return obj.get_validation_status_display()

    class Meta:
        model = ModelYearReportHistory
        fields = (
            'update_timestamp', 'validation_status',
        )
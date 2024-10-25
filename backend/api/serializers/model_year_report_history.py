from enumfields.drf import EnumField
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from ..models.model_year_report_history import ModelYearReportHistory
from ..models.model_year_report_statuses import ModelYearReportStatuses
from ..mixins.user_mixin import get_user_data

class ModelYearReportHistorySerializer(ModelSerializer):
    
    create_user = SerializerMethodField()
    validation_status = EnumField(ModelYearReportStatuses, read_only=True)

    class Meta:
        model = ModelYearReportHistory
        fields = ('create_timestamp', 'create_user', 'validation_status')

    def get_create_user(self, obj):
        return get_user_data(obj, 'create_user', self.context.get('request'))

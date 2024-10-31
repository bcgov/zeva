from enumfields.drf import EnumField
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.mixins.user_mixin import UserSerializerMixin

class ModelYearReportHistorySerializer(UserSerializerMixin):
    
    validation_status = EnumField(ModelYearReportStatuses, read_only=True)

        
    class Meta:
        model = ModelYearReportHistory
        fields = ('create_timestamp', 'create_user', 'validation_status')

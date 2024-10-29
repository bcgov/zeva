from enumfields.drf import EnumField
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from ..models.model_year_report_history import ModelYearReportHistory
from ..models.model_year_report_statuses import ModelYearReportStatuses
from ..mixins.user_mixin import UserMixin

class ModelYearReportHistorySerializer(ModelSerializer, UserMixin):
    
    create_user = SerializerMethodField()
    validation_status = EnumField(ModelYearReportStatuses, read_only=True)

        
    class Meta:
        model = ModelYearReportHistory
        fields = ('create_timestamp', 'create_user', 'validation_status')

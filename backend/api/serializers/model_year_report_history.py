from enumfields.drf import EnumField
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from ..models.model_year_report_history import ModelYearReportHistory
from ..models.model_year_report_statuses import ModelYearReportStatuses
from ..models.user_profile import UserProfile
from ..serializers.user import MemberSerializer
from ..mixins.create_user_mixin import CreateUserMixin

class ModelYearReportHistorySerializer(ModelSerializer, CreateUserMixin):
    
    create_user = SerializerMethodField()
    validation_status = EnumField(ModelYearReportStatuses, read_only=True)

    class Meta:
        model = ModelYearReportHistory
        fields = ('create_timestamp', 'create_user', 'validation_status')

    def get_create_user(self, obj):
        return self.get_create_user_data(obj)
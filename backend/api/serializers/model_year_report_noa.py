from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField
from enumfields.drf import EnumField
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.supplemental_report_history import SupplementalReportHistory
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer, UserSerializer


class ModelYearReportNoaSerializer(ModelSerializer):
    validation_status = SerializerMethodField()

    def get_validation_status(self, obj):
        if obj.validation_status in [
            ModelYearReportStatuses.ASSESSED,
        ]:
            return obj.get_validation_status_display()

    class Meta:
        model = ModelYearReportHistory
        fields = (
            'update_timestamp', 'validation_status', 'id',
        )


class SupplementalNOASerializer(ModelSerializer):
    status = SerializerMethodField()
    update_user = SerializerMethodField()
    is_reassessment = SerializerMethodField()

    def get_status(self, obj):
        return obj.validation_status.value

    def get_update_user(self, obj):
        user = UserProfile.objects.filter(username=obj.update_user).first()
        if user is None:
            return obj.create_user
        return user.display_name

    def get_is_reassessment(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user is None:
            return False

        if user.is_government:
            return True
        
        return False


    class Meta:
        model = SupplementalReportHistory
        fields = (
            'update_timestamp', 'status', 'id', 'update_user', 'supplemental_report_id',
            'is_reassessment'
        )

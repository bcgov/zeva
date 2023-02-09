from enumfields.drf import EnumField
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer


class ModelYearReportHistorySerializer(ModelSerializer):
    create_user = SerializerMethodField()
    validation_status = EnumField(ModelYearReportStatuses, read_only=True)

    def get_create_user(self, obj):
        request = self.context.get("request")
        original_creator = self.context.get("original_creator")
        is_government = False
        if request:
            is_government = request.user.is_government
        user_profile = UserProfile.objects.filter(username=obj.create_user)
        if is_government and obj.validation_status is ModelYearReportStatuses.RECOMMENDED:
            user_profile = UserProfile.objects.filter(username=original_creator.create_user)
        else:
            user_profile = UserProfile.objects.filter(username=obj.create_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.create_user

    class Meta:
        model = ModelYearReportHistory
        fields = ('create_timestamp', 'create_user', 'validation_status')

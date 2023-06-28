from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField
from api.models.model_year_report_assessment_comment import ModelYearReportAssessmentComment
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer


class ModelYearReportAssessmentCommentSerializer(ModelSerializer):
    """
    Serializer for assessment comments
    """
    create_user = SerializerMethodField()

    def get_create_user(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user is None:
            return obj.create_user

        serializer = MemberSerializer(user, read_only=True)
        return serializer.data

    class Meta:
        model = ModelYearReportAssessmentComment
        fields = (
            'id', 'comment', 'create_timestamp', 'create_user', 'to_director'
        )
        read_only_fields = (
            'id',
        )

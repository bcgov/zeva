from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField
from api.models.model_year_report_assessment_comment import ModelYearReportAssessmentComment
from ..mixins.user_mixin import UserMixin

class ModelYearReportAssessmentCommentSerializer(ModelSerializer, UserMixin):
    """
    Serializer for assessment comments
    """
    create_user = SerializerMethodField()
    
    class Meta:
        model = ModelYearReportAssessmentComment
        fields = (
            'id', 'comment', 'create_timestamp', 'create_user', 'to_director'
        )
        read_only_fields = (
            'id',
        )

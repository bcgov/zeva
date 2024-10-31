from api.models.model_year_report_assessment_comment import ModelYearReportAssessmentComment
from api.mixins.user_mixin import UserSerializerMixin

class ModelYearReportAssessmentCommentSerializer(UserSerializerMixin):
    """
    Serializer for assessment comments
    """
    
    class Meta:
        model = ModelYearReportAssessmentComment
        fields = (
            'id', 'comment', 'create_timestamp', 'create_user', 'to_director'
        )
        read_only_fields = (
            'id',
        )

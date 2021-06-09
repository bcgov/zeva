from datetime import date
from django.db.models import Sum, Value, Q
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField, CharField, \
    ListField
from api.models.account_balance import AccountBalance
from api.models.credit_transaction import CreditTransaction
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_assessment import ModelYearReportAssessment
from api.models.model_year_report_assessment_comment import ModelYearReportAssessmentComment
from api.serializers.model_year_report_assessment_comment import ModelYearReportAssessmentCommentSerializer
from api.models.model_year_report_assessment_descriptions import ModelYearReportAssessmentDescriptions

class ModelYearReportAssessmentDescriptionsSerializer(ModelSerializer):
    class Meta:
        model = ModelYearReportAssessmentDescriptions
        fields = (
            'id', 'description', 'display_order'
        )


class ModelYearReportAssessmentSaveSerializer(
        ModelSerializer
):
    assessment_comment = ModelYearReportAssessmentCommentSerializer(
        allow_null=True,
        required=False
    )

    def update(self, instance, validated_data):
        request = self.context.get('request')
        model_year_report_assessment_comment = validated_data.pop('assessment_comment', None)
        if model_year_report_assessment_comment:
            ModelYearReportAssessmentComment.objects.create(
                create_user=request.user.username,
                ModelYearReport=instance,
                comment=model_year_report_assessment_comment.get('comment')
            )
        ModelYearReportAssessment.objects.create(
            ModelYearReport=instance.id,
            update_user=request.user.username,
            create_user=request.user.username,
        )
        return

    class Meta:
        model = ModelYearReportAssessment
        fields = (
            'id', 'assessment_comment',
            'model_year_report_assessment_description'
        )


class ModelYearReportAssessmentSerializer(
        ModelSerializer
):
    assessment_comment = SerializerMethodField()
    assessment = SerializerMethodField()
    descriptions = SerializerMethodField()

    def get_descriptions(self, obj):
        descriptions = ModelYearReportAssessmentDescriptions.objects.filter()
        serializer = ModelYearReportAssessmentDescriptionsSerializer(
            descriptions,
            read_only=True,
            many=True,
            )
        return serializer.data

    def get_assessment(self, obj):
        assessment = ModelYearReportAssessment.objects.filter(
            model_year_report=obj
        ).first()
        if not assessment:
            return {
                'decision': None,
                'penalty': None
            }
        description_serializer = ModelYearReportAssessmentDescriptionsSerializer(
            assessment.model_year_report_assessment_description,
            read_only=True,
            )
        return {
            'decision': description_serializer.data['description'],
            'penalty': assessment.penalty
        }

    def get_assessment_comment(self, obj):
        assessment_comment = ModelYearReportAssessmentComment.objects.filter(
            model_year_report=obj
        ).order_by('-create_timestamp')

        if not assessment_comment:
            return []
        serializer = ModelYearReportAssessmentCommentSerializer(
            assessment_comment, read_only=True, many=True
        )
        return serializer.data

    class Meta:
        model = ModelYearReport
        fields = (
            'id', 'assessment_comment',
            'assessment', 'descriptions'
        )

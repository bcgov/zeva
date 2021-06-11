from datetime import date
from django.db.models import Sum, Value, Q
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField, CharField, \
    ListField
from api.models.account_balance import AccountBalance
from api.models.credit_transaction import CreditTransaction
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_assessment import ModelYearReportAssessment
from api.models.model_year_report_assessment_comment import ModelYearReportAssessmentComment
from api.serializers.model_year_report_assessment_comment import ModelYearReportAssessmentCommentSerializer
from api.models.model_year_report_assessment_descriptions import ModelYearReportAssessmentDescriptions
from api.models.model_year_report_compliance_obligation import ModelYearReportComplianceObligation
from api.serializers.vehicle import ModelYearSerializer
from api.models.model_year import ModelYear


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
        in_compliance = True
        report = ModelYearReport.objects.get(
            id=obj.id
        )
        report_year_obj = ModelYear.objects.get(
            id=report.model_year_id
        )
        report_year_int = int(report_year_obj.name)
        prior_year_int = report_year_int - 1
        prior_year_report = ModelYearReport.objects.get(
            ## fix this ######
            model_year_id=25
            ##################

        )
        prior_year = {'model_year': str(prior_year_int), 'a': 0, 'b': 0}
        report_year = {'model_year': str(report_year_int), 'a': 0, 'b': 0}
        description_serializer = ModelYearReportAssessmentDescriptionsSerializer(
            assessment.model_year_report_assessment_description,
            read_only=True,
            )
        deficit_report_year = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=obj,
            category='CreditDeficit'
        ).first()

        if deficit_report_year:
            report_year = {'model_year': report_year, 'a': deficit_report_year.credit_a_value, 'b': deficit_report_year.credit_b_value}
            in_compliance = False
        
        deficit_prior_year = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=prior_year_report,
            category='CreditDeficit'
        ).first()
        if deficit_prior_year:
            in_compliance = False
            prior_year = {'model_year': prior_year, 'a': deficit_prior_year.credit_a_value, 'b': deficit_prior_year.credit_b_value}

        deficit_values = {'prior': prior_year, 'report': report_year}
        return {
            'decision': description_serializer.data['description'],
            'penalty': assessment.penalty,
            'deficit': deficit_values,
            'in_compliance': in_compliance
        }

    def get_assessment_comment(self, obj):
        request = self.context.get('request')
        assessment_comment = ModelYearReportAssessmentComment.objects.filter(
            model_year_report=obj
            
        ).order_by('-create_timestamp')
        if not request.user.is_government:
            assessment_comment = ModelYearReportAssessmentComment.objects.filter(
                model_year_report=obj,
                to_director=False
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

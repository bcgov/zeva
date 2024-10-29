from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_assessment import ModelYearReportAssessment
from api.models.model_year_report_assessment_comment import ModelYearReportAssessmentComment
from api.serializers.model_year_report_assessment_comment import ModelYearReportAssessmentCommentSerializer
from api.models.model_year_report_assessment_descriptions import ModelYearReportAssessmentDescriptions
from api.models.model_year_report_compliance_obligation import ModelYearReportComplianceObligation
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
            model_year_report=obj,
            display=True
        ).first()            
        in_compliance = {'report': True, 'prior': True}
        ##get the report
        report = ModelYearReport.objects.get(
            id=obj.id
        )
        ##get the report year 
        report_year_obj = ModelYear.objects.get(
            id=report.model_year_id
        )
        # report_year_int = int(report_year_obj.name)
        report_year_str = report_year_obj.name
        prior_year_str = str(int(report_year_str) - 1)
        prior_year_deficit = {'model_year': prior_year_str, 'a': 0, 'b': 0}
        report_year_deficit = {'model_year': report_year_str, 'a': 0, 'b': 0}

        ## try to get the report for the prior year as well as the compliance obligation (deficit)
        prior_year_report_obj = ModelYearReport.objects.filter(
            model_year__name=prior_year_str
        ).first()

        from_gov = False

        # are there overrides?
        # if so, then we should only get the ones from 
        has_override = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=obj.id,
            from_gov=True
        ).first()

        if has_override:
            from_gov = True

        deficit_prior_year_obj = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=prior_year_report_obj,
            category='CreditDeficit',
            from_gov=from_gov
        ).first()
        if deficit_prior_year_obj:
            in_compliance['prior'] = False
            prior_year_deficit['a'] = deficit_prior_year_obj.credit_a_value
            prior_year_deficit['b'] = deficit_prior_year_obj.credit_b_value

        deficit_report_year = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=obj,
            category='CreditDeficit',
            from_gov=from_gov
        ).first()

        if deficit_report_year:
            in_compliance['report'] = False
            report_year_deficit['a'] = deficit_report_year.credit_a_value
            report_year_deficit['b'] = deficit_report_year.credit_b_value
        deficit_values = {'prior': prior_year_deficit, 'report': report_year_deficit}

        if not assessment:
            return {
                'decision': {'id': None, 'description': None},
                'penalty': None,
                'in_compliance': in_compliance,
                'deficit': deficit_values,
            }
        description_serializer = ModelYearReportAssessmentDescriptionsSerializer(
            assessment.model_year_report_assessment_description,
            read_only=True,
            )
       
        return {
            'decision': {'description': description_serializer.data['description'], 'id': description_serializer.data['id'] },
            'penalty': assessment.penalty,
            'deficit': deficit_values,
            'in_compliance': in_compliance
        }

    def get_assessment_comment(self, obj):
        request = self.context.get('request')
        assessment_comment = ModelYearReportAssessmentComment.objects.filter(
            model_year_report=obj,
            display=True
        ).order_by('-create_timestamp')
        if not request.user.is_government:
            assessment_comment = ModelYearReportAssessmentComment.objects.filter(
                model_year_report=obj,
                to_director=False,
                display=True
            ).order_by('-create_timestamp')
        if not assessment_comment:
            return []
        serializer = ModelYearReportAssessmentCommentSerializer(
            assessment_comment, read_only=True, many=True, context={'request': request}
        )
        return serializer.data

    class Meta:
        model = ModelYearReport
        fields = (
            'id', 'assessment_comment',
            'assessment', 'descriptions'
        )

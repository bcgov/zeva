from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_ldv_sales import \
    ModelYearReportLDVSales
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.permissions.model_year_report import ModelYearReportPermissions
from api.serializers.model_year_report import \
    ModelYearReportSerializer, ModelYearReportListSerializer, \
    ModelYearReportSaveSerializer
from api.serializers.model_year_report_history import \
    ModelYearReportHistorySerializer
from api.serializers.model_year_report_make import \
    ModelYearReportMakeSerializer
from api.serializers.organization import OrganizationSerializer
from api.serializers.organization_address import OrganizationAddressSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.serializers.model_year_report_assessment import \
    ModelYearReportAssessmentSerializer
from api.models.model_year_report_assessment_comment import \
    ModelYearReportAssessmentComment
from api.models.model_year_report_assessment import \
    ModelYearReportAssessment
from api.services.model_year_report import \
    get_model_year_report_statuses, adjust_credits
from api.serializers.organization_ldv_sales import \
    OrganizationLDVSalesSerializer
from auditable.views import AuditableMixin
from api.services.send_email import notifications_model_year_report
from api.serializers.model_year_report_supplemental import \
    ModelYearReportSupplementalSerializer, ModelYearReportSupplementalSupplierSerializer
from api.models.supplemental_report_supplier_information import SupplementalReportSupplierInformation
from api.models.supplemental_report_credit_activity import \
    SupplementalReportCreditActivity


class ModelYearReportViewset(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.ListModelMixin, mixins.RetrieveModelMixin,
        mixins.CreateModelMixin, mixins.UpdateModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = (ModelYearReportPermissions,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'default': ModelYearReportSerializer,
        'create': ModelYearReportSaveSerializer,
        'list': ModelYearReportListSerializer,
        'update': ModelYearReportSaveSerializer,
        'partial_update': ModelYearReportSaveSerializer,
    }

    def get_queryset(self):
        request = self.request

        if request.user.organization.is_government:
            queryset = ModelYearReport.objects.exclude(validation_status=(
                ModelYearReportStatuses.DRAFT
            ))

            organization_id = request.query_params.get('organization_id', None)

            if organization_id:
                queryset = queryset.filter(organization_id=organization_id)
        else:
            queryset = ModelYearReport.objects.filter(
                organization_id=request.user.organization.id
            )

        return queryset

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def retrieve(self, request, pk=None):
        queryset = self.get_queryset()
        report = get_object_or_404(queryset, pk=pk)
        summary_param = request.GET.get('summary', None)
        summary = True if summary_param == "true" else None

        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=pk,
            signing_authority_assertion__module="supplier_information"
        ).first()

        if not confirmation and not summary:
            model_year = ModelYearSerializer(report.model_year)
            model_year_int = int(model_year.data['name'])
           
            addresses = OrganizationAddressSerializer(
                request.user.organization.organization_address, many=True
            )
            organization = OrganizationSerializer(
                request.user.organization
            )

            makes_list = ModelYearReportMake.objects.filter(
                model_year_report_id=report.id,
                from_gov=False
            ).values('make').distinct()

            makes = ModelYearReportMakeSerializer(makes_list, many=True)

            history_list = ModelYearReportHistory.objects.filter(
                model_year_report_id=pk
            )

            history = ModelYearReportHistorySerializer(history_list, many=True)

            confirmations = ModelYearReportConfirmation.objects.filter(
                model_year_report_id=pk
            ).values_list(
                'signing_authority_assertion_id', flat=True
            ).distinct()

            org = request.user.organization

            avg_sales = org.get_avg_ldv_sales(year=model_year_int)

            ldv_sales_previous_list = org.get_ldv_sales(year=model_year_int)
            ldv_sales_previous = OrganizationLDVSalesSerializer(
                ldv_sales_previous_list, many=True)

            # if this is empty that means we don't have enough ldv_sales to
            # get the average. our avg_sales at this point should be from the
            # current report ldv_sales
            if not avg_sales:
                report_ldv_sales = ModelYearReportLDVSales.objects.filter(
                    model_year_report_id=pk,
                    model_year__name=model_year_int
                ).order_by('-update_timestamp').first()

                if report_ldv_sales:
                    avg_sales = report_ldv_sales.ldv_sales

                ldv_sales_previous = None

            validation_status = report.validation_status.value

            if validation_status in ['RECOMMENDED', 'RETURNED']:
                validation_status = ModelYearReportStatuses.SUBMITTED

            return Response({
                'avg_sales': avg_sales,
                'organization': organization.data,
                'organization_name': request.user.organization.name,
                'model_year_report_addresses': addresses.data,
                'makes': makes.data,
                'model_year_report_history': history.data,
                'validation_status': report.validation_status.value,
                'supplier_class': org.get_current_class(avg_sales=avg_sales),
                'model_year': model_year.data,
                'create_user': report.create_user,
                'confirmations': confirmations,
                'ldv_sales': report.ldv_sales,
                'statuses': get_model_year_report_statuses(report, request.user),
                'ldv_sales_previous': ldv_sales_previous.data
                if ldv_sales_previous else [],
                'credit_reduction_selection': report.credit_reduction_selection
            })

        serializer = ModelYearReportSerializer(
            report, context={'request': request}
        )

        return Response(serializer.data)

    @action(detail=True)
    def makes(self, request, pk=None):
        queryset = self.get_queryset()
        report = get_object_or_404(queryset, pk=pk)
        supplier_makes_list = ModelYearReportMake.objects.filter(
                model_year_report_id=report.id,
                from_gov=False
            ).values('make').distinct()

        supplier_makes = ModelYearReportMakeSerializer(supplier_makes_list, many=True)
        gov_makes_list = ModelYearReportMake.objects.filter(
                model_year_report_id=report.id,
                from_gov=True
            ).values('make').distinct()

        gov_makes = ModelYearReportMakeSerializer(gov_makes_list, many=True)
        return Response({
            'supplier_makes': supplier_makes.data,
            'gov_makes': gov_makes.data
        })

    @action(detail=True)
    def submission_confirmation(self, request, pk=None):
        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=pk,
            signing_authority_assertion__module="compliance_summary"
        ).values_list(
                'signing_authority_assertion_id', flat=True
        )

        return Response({'confirmation': confirmation})

    @action(detail=False, methods=['patch'])
    def submission(self, request):
        validation_status = request.data.get('validation_status')
        model_year_report_id = request.data.get('model_year_report_id')
        confirmations = request.data.get('confirmation', None)
        description = request.data.get('description')

        model_year_report_update = ModelYearReport.objects.filter(
            id=model_year_report_id
        )

        if validation_status:
            if validation_status == 'RECOMMENDED' and not description:
                # returning a 200 to bypass the rest of the update
                return HttpResponse(
                    status=200, content="Recommendation is required"
                )

            model_year_report_update.update(
                validation_status=validation_status)
            model_year_report_update.update(update_user=request.user.username)

            ModelYearReportHistory.objects.create(
                model_year_report_id=model_year_report_id,
                validation_status=validation_status,
                update_user=request.user.username,
                create_user=request.user.username,
            )

            # check for if validation status is recommended
            if validation_status == 'RECOMMENDED' or \
                    (validation_status == 'SUBMITTED' and description) or \
                    (validation_status == 'RETURNED' and description):
                # do "update or create" to create the assessment object
                penalty = request.data.get('penalty')
                ModelYearReportAssessment.objects.update_or_create(
                    model_year_report_id=model_year_report_id,
                    defaults={
                        'update_user': request.user.username,
                        'model_year_report_assessment_description_id': description,
                        'penalty': penalty
                    }
                )

            if validation_status == 'ASSESSED':
                adjust_credits(model_year_report_id, request)
            
            notifications_model_year_report(validation_status, request.user)

        if confirmations:
            for confirmation in confirmations:
                summary_confirmation = ModelYearReportConfirmation.objects.create(
                    create_user=request.user.username,
                    model_year_report_id=model_year_report_id,
                    has_accepted=True,
                    title=request.user.title,
                    signing_authority_assertion_id=confirmation
                )
                summary_confirmation.save()

        return HttpResponse(
            status=201, content="Report Submitted"
        )

    @action(detail=True, methods=['patch'])
    def assessment_patch(self, request, pk):
        if not request.user.is_government:
            return HttpResponse(
                status=403, content=None
            )

        makes = request.data.get('makes', None)
        makes_delete = ModelYearReportMake.objects.filter(
                from_gov=True
            )
        makes_delete.delete()
        report = get_object_or_404(ModelYearReport, pk=pk)

        if makes and isinstance(makes, list):
            for make in makes:
                found = report.makes.filter(
                    make__iexact=make
                )

                if not found:
                    ModelYearReportMake.objects.create(
                        model_year_report=report,
                        make=make,
                        create_user=request.user.username,
                        update_user=request.user.username,
                        from_gov=True
                    )

        sales = request.data.get('sales', None)

        if sales:
            for key, value in sales.items():
                model_year = ModelYear.objects.filter(
                    name=key
                ).first()
                if model_year:
                    ModelYearReportLDVSales.objects.update_or_create(
                        model_year_id=model_year.id,
                        model_year_report=report,
                        from_gov=True,
                        defaults={
                            'ldv_sales': value,
                            'create_user': request.user.username,
                            'update_user': request.user.username
                        }
                    )

        report = get_object_or_404(ModelYearReport, pk=pk)

        serializer = ModelYearReportSerializer(report, context={'request': request})

        return Response(serializer.data)

    @action(detail=True, methods=['post', 'patch'])
    def comment_save(self, request, pk):
        comment = request.data.get('comment')
        director = request.data.get('director')
        if comment and director:
            ModelYearReportAssessmentComment.objects.create(
                model_year_report_id=pk,
                comment=comment,
                to_director=True,
                create_user=request.user.username,
                update_user=request.user.username,
            )
        elif comment and not director:
            assessment_comment = ModelYearReportAssessmentComment.objects.filter(
                model_year_report_id=pk,
                to_director=False
            ).order_by('-update_timestamp').first()

            if assessment_comment:
                assessment_comment.comment = comment
                assessment_comment.update_user = request.user.username
                assessment_comment.save()
            else:
                ModelYearReportAssessmentComment.objects.create(
                    model_year_report_id=pk,
                    to_director=False,
                    comment=comment,
                    create_user=request.user.username,
                    update_user=request.user.username
                )

        report = get_object_or_404(ModelYearReport, pk=pk)

        serializer = ModelYearReportSerializer(report, context={'request': request})

        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def assessment(self, request, pk):
        report = get_object_or_404(ModelYearReport, pk=pk)
        serializer = ModelYearReportAssessmentSerializer(report, context={'request': request})
        if not request.user.is_government and report.validation_status is not ModelYearReportStatuses.ASSESSED:
            return HttpResponse(
                status=403, content=None
            )
        return Response(serializer.data)

    @action(detail=False)
    def years(self, _request):
        """
        Get the years
        """
        years = ModelYear.objects.all().order_by('-name')
        serializer = ModelYearSerializer(years, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def supplemental(self, request, pk):
        model_year_report = ModelYearReport.objects.get(id=pk)
        report = get_object_or_404(ModelYearReport, pk=pk)

        serializer = ModelYearReportSupplementalSerializer(
            report.supplemental
        )

        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def supplemental_save(self, request, pk):
        report = get_object_or_404(ModelYearReport, pk=pk)

        # update the existing supplemental if it exists
        if report.supplemental:
            serializer = ModelYearReportSupplementalSerializer(
                report.supplemental,
                data=request.data
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(
                model_year_report_id=report.id,
                update_user=request.user.username
            )

        # otherwise create a new one
        else:
            serializer = ModelYearReportSupplementalSerializer(
                data=request.data
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(
                model_year_report_id=report.id,
                create_user=request.user.username,
                update_user=request.user.username
            )
        report = get_object_or_404(ModelYearReport, pk=pk)
        supplier_information = request.data.get('supplier_info')
        if supplier_information:
            for k, v in supplier_information.items():
                SupplementalReportSupplierInformation.objects.create(
                    update_user=request.user.username,
                    create_user=request.user.username,
                    supplemental_report_id=report.supplemental.id,
                    category=k.upper(),
                    value=v
                )

        credit_activity = request.data.get('credit_activity')
        if credit_activity:
            SupplementalReportCreditActivity.objects.filter(
                supplemental_report_id=report.supplemental.id
            ).delete()

            for activity in credit_activity:
                SupplementalReportCreditActivity.objects.create(
                    update_user=request.user.username,
                    create_user=request.user.username,
                    supplemental_report_id=report.supplemental.id,
                    category=activity.get('category'),
                    credit_a_value=activity.get('credit_a_value'),
                    credit_b_value=activity.get('credit_b_value'),
                    model_year_id=activity.get('model_year_id')
                )

        return Response(serializer.data)

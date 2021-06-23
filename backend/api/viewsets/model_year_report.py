from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from api.models.credit_class import CreditClass
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_adjustment import ModelYearReportAdjustment
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
from api.services.model_year_report import get_model_year_report_statuses
from api.serializers.organization_ldv_sales import \
    OrganizationLDVSalesSerializer
from auditable.views import AuditableMixin


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
                'statuses': get_model_year_report_statuses(report),
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

        model_year_report_update = ModelYearReport.objects.filter(
            id=model_year_report_id
        )
        if validation_status:
            model_year_report_update.update(
                validation_status=validation_status)
            model_year_report_update.update(update_user=request.user.username)

            ModelYearReportHistory.objects.create(
                model_year_report_id=model_year_report_id,
                validation_status=validation_status,
                update_user=request.user.username,
                create_user=request.user.username,
            )
            ## check for if validation status is recommended
            if validation_status == 'RECOMMENDED':
                ## do "update or create" to create the assessment object
                description = request.data.get('description')
                penalty = request.data.get('penalty')
                ModelYearReportAssessment.objects.update_or_create(
                    model_year_report_id=model_year_report_id,
                    defaults={
                        'update_user': request.user.username,
                        'model_year_report_assessment_description_id': description,
                        'penalty': penalty
                    }

                )


        
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

        adjustments = request.data.get('adjustments', None)
        if adjustments and isinstance(adjustments, list):
            ModelYearReportAdjustment.objects.filter(
                model_year_report=report
            ).delete()

            for adjustment in adjustments:
                model_year = ModelYear.objects.filter(
                    name=adjustment.get('model_year')
                ).first()

                credit_class = CreditClass.objects.filter(
                    credit_class=adjustment.get('credit_class')
                ).first()

                is_reduction = False

                if adjustment.get('type') == 'Reduction':
                    is_reduction = True

                if model_year and credit_class and adjustment.get('quantity'):
                    ModelYearReportAdjustment.objects.create(
                        credit_class_id=credit_class.id,
                        model_year_id=model_year.id,
                        number_of_credits=adjustment.get('quantity'),
                        is_reduction=is_reduction,
                        model_year_report=report,
                        create_user=request.user.username,
                        update_user=request.user.username,
                    )

        report = get_object_or_404(ModelYearReport, pk=pk)

        serializer = ModelYearReportSerializer(report, context={'request': request})

        return Response(serializer.data)

    @action(detail=True, methods=['post', 'patch'])
    def comment_save(self, request, pk):
        comment = request.data.get('comment')
        director = request.data.get('director')
        if comment:
            ModelYearReportAssessmentComment.objects.create(
                model_year_report_id=pk,
                comment=comment,
                to_director=director,
                create_user=request.user.username,
                update_user=request.user.username,
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

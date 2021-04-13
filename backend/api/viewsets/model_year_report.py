from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_make import ModelYearReportMake
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
from auditable.views import AuditableMixin
from api.models.model_year_report_statuses import ModelYearReportStatuses


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

        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=pk,
            signing_authority_assertion__module="supplier_information"
        ).first()

        if not confirmation:
            model_year = ModelYearSerializer(report.model_year)

            addresses = OrganizationAddressSerializer(
                request.user.organization.organization_address, many=True
            )
            organization = OrganizationSerializer(
                request.user.organization
            )

            makes_list = ModelYearReportMake.objects.filter(
                model_year_report_id=report.id
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

            return Response({
                'organization': organization.data,
                'organization_name': request.user.organization.name,
                'model_year_report_addresses': addresses.data,
                'makes': makes.data,
                'model_year_report_history': history.data,
                'validation_status': report.validation_status.value,
                'supplier_class': report.supplier_class,
                'model_year': model_year.data,
                'create_user': report.create_user,
                'confirmations': confirmations,
                'ldv_sales': report.ldv_sales
            })

        serializer = ModelYearReportSerializer(report)

        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def submission(self, request):
        validation_status = request.data.get('validation_status')
        model_year_report_id = request.data.get('model_year_report_id')

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

        return HttpResponse(
            status=201, content="Report Submitted"
        )

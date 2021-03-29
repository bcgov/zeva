from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import mixins, viewsets

from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_confirmation import ModelYearReportConfirmation
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.vehicle import Vehicle
from api.permissions.model_year_report import ModelYearReportPermissions
from api.serializers.model_year_report import \
    ModelYearReportSerializer, ModelYearReportListSerializer, \
    ModelYearReportSaveSerializer
from api.serializers.model_year_report_history import ModelYearReportHistorySerializer
from api.serializers.model_year_report_make import ModelYearReportMakeSerializer
from api.serializers.organization import OrganizationSerializer
from api.serializers.organization_address import OrganizationAddressSerializer
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
            addresses = OrganizationAddressSerializer(
                request.user.organization.organization_address, many=True
            )
            organization = OrganizationSerializer(
                request.user.organization
            )

            makes_list = Vehicle.objects.filter(
                organization_id=request.user.organization_id
            ).values('make').distinct()

            makes = ModelYearReportMakeSerializer(makes_list, many=True)

            history_list = ModelYearReportHistory.objects.filter(
                model_year_report_id=pk
            )

            history = ModelYearReportHistorySerializer(history_list, many=True)

            confirmations = ModelYearReportConfirmation.objects.filter(
                model_year_report_id=pk
            ).values_list('signing_authority_assertion_id', flat=True).distinct()

            return Response({
                'organization': organization.data,
                'organization_name': request.user.organization.name,
                'model_year_report_addresses': addresses.data,
                'makes': makes.data,
                'model_year_report_history': history.data,
                'validation_status': report.validation_status.value,
                'supplier_class': report.supplier_class,
                'model_year': report.model_year.name,
                'create_user': report.create_user,
                'confirmations': confirmations
            })

        serializer = ModelYearReportSerializer(report)

        return Response(serializer.data)

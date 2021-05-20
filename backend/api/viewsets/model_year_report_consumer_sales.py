from rest_framework import mixins, viewsets
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404

from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year import ModelYear
from api.models.model_year_report_ldv_sales import \
    ModelYearReportLDVSales
from api.models.model_year_report_statuses import ModelYearReportStatuses

from api.permissions.model_year_report import ModelYearReportPermissions

from api.serializers.model_year_report_history import \
    ModelYearReportHistorySerializer
from api.serializers.model_year_report_vehicle import \
    ModelYearReportVehicleSerializer, ModelYearReportVehicleSaveSerializer
from api.serializers.model_year_report_ldv_sales import \
    ModelYearReportLDVSalesSerializer
from api.serializers.model_year_report import ModelYearReportSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.services.vehicle import vehicles_sales
from api.serializers.vehicle import VehicleSalesSerializer


class ModelYearReportConsumerSalesViewSet(mixins.ListModelMixin,
                                          mixins.CreateModelMixin,
                                          viewsets.GenericViewSet):

    permission_classes = (ModelYearReportPermissions,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = ModelYearReport.objects.all()

    serializer_classes = {
        'default': ModelYearReportSerializer,
        'create': ModelYearReportVehicleSaveSerializer,
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def create(self, request, *args, **kwargs):
        vehicles = request.data.get('data')
        model_year_report_id = request.data.get('model_year_report_id')
        confirmations = request.data.get('confirmation')

        report = ModelYearReport.objects.get(id=model_year_report_id)

        """
        Save/Update vehicle information
        """
        vehicles_delete = ModelYearReportVehicle.objects.filter(
            model_year_report_id=model_year_report_id
        )
        vehicles_delete.delete()

        for vehicle in vehicles:
            serializer = ModelYearReportVehicleSaveSerializer(
                data=vehicle,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            model_year_report_vehicle = serializer.save()

        """
        Save/Update confirmation
        """

        for confirmation in confirmations:

            confirmation_delete = ModelYearReportConfirmation.objects.filter(
                signing_authority_assertion_id=confirmation).filter(
                    model_year_report=report)
            confirmation_delete.delete()

            consumer_sales_confirmation = ModelYearReportConfirmation.objects.create(
                create_user=request.user.username,
                model_year_report=report,
                has_accepted=True,
                title=request.user.title,
                signing_authority_assertion_id=confirmation
            )
            consumer_sales_confirmation.save()

        ModelYearReportHistory.objects.create(
                model_year_report_id=model_year_report_id,
                validation_status=ModelYearReportStatuses.DRAFT,
                update_user=request.user.username,
                create_user=request.user.username,
        )

        return Response(
           {"status": "saved"}
        )

    def retrieve(self, request, pk):
        vehicles = None
        queryset = self.get_queryset()
        report = get_object_or_404(queryset, pk=pk)
        model_year = ModelYearSerializer(report.model_year)
        organization = request.user.organization.id
        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=pk,
            signing_authority_assertion__module="consumer_sales"
        ).values_list(
            'signing_authority_assertion_id', flat=True
        ).distinct()

        if confirmation:
            vehicle = ModelYearReportVehicle.objects.filter(
                model_year_report_id=report.id)
            vehicles_serializer = ModelYearReportVehicleSerializer(
                vehicle, many=True)

        else:
            vehicle = vehicles_sales(model_year, organization)
            vehicles_serializer = VehicleSalesSerializer(vehicle, many=True)

        vehicles = vehicles_serializer.data

        history_list = ModelYearReportHistory.objects.filter(
                model_year_report_id=pk
        )

        history = ModelYearReportHistorySerializer(history_list, many=True)

        return Response({
            'vehicle_list': vehicles,
            'model_year_report_history': history.data,
            'confirmations': confirmation,
            'organization_name': request.user.organization.name,
            'validation_status': report.validation_status.value,
            })

from rest_framework import mixins, viewsets, permissions, status
from django.shortcuts import get_object_or_404
from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.vehicle import Vehicle
from api.serializers.model_year_report_history import \
    ModelYearReportHistorySerializer
from rest_framework.decorators import action
from api.models.model_year import ModelYear
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report_previous_sales import \
    ModelYearReportPreviousSales
from rest_framework.response import Response
from api.permissions.model_year_report import ModelYearReportPermissions

from api.serializers.model_year_report_vehicle import \
    ModelYearReportVehicleSerializer, ModelYearReportVehicleSaveSerializer
from api.serializers.model_year_report_previous_sales import \
    ModelYearReportPreviousSalesSerializer
from api.serializers.model_year_report import ModelYearReport
from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.serializers.model_year_report import ModelYearReportSerializer
from api.serializers.organization import OrganizationSerializer


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
        ldv_sales = request.data.get('ldv_sales')
        previous_sales = request.data.get('previous_sales')
        confirmations = request.data.get('confirmation')
        supplier_class = request.data.get('supplier_class')
        previouse_years_exist = request.data.get('previous_years_exist')

        report = ModelYearReport.objects.get(id=model_year_report_id)

        """
        Update LDV sales
        """
        model_year_report_update = ModelYearReport.objects.filter(
            id=model_year_report_id
        )
        model_year_report_update.update(ldv_sales=ldv_sales)
        model_year_report_update.update(supplier_class=supplier_class)

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
        Save previous years LDV sales information
        """
        if not previouse_years_exist:
            for previous_sale in previous_sales:
                model_year_report_previous_sale = ModelYearReportPreviousSales.objects.create(
                    previous_sales=previous_sale.get('ldv_sales'),
                    model_year=ModelYear.objects.get(name=previous_sale.get('model_year')),
                    model_year_report=report
                )
                model_year_report_previous_sale.save()

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

        return Response(
           {"status": "saved"}
        )

    def retrieve(self, request, pk):
        queryset = self.get_queryset()
        report = get_object_or_404(queryset, pk=pk)

        previous_sales = ModelYearReportPreviousSales.objects.filter(
            model_year_report_id=report.id)
        previous_sales_serializer = ModelYearReportPreviousSalesSerializer(
            previous_sales, many=True)

        vehicle = ModelYearReportVehicle.objects.filter(
            model_year_report_id=report.id)
        vehicles_serializer = ModelYearReportVehicleSerializer(vehicle, many=True)

        ldv_sales = ModelYearReport.objects.values_list(
            'ldv_sales', flat=True).get(
            id=report.id)

        history_list = ModelYearReportHistory.objects.filter(
                model_year_report_id=pk
            )

        history = ModelYearReportHistorySerializer(history_list, many=True)

        confirmations = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=pk,
            signing_authority_assertion__module="consumer_sales"
        ).values_list(
            'signing_authority_assertion_id', flat=True
        ).distinct()

        return Response({
            'previous_sales': previous_sales_serializer.data,
            'vehicle_list': vehicles_serializer.data,
            'ldv_sales': ldv_sales,
            'model_year_report_history': history.data,
            'confirmations': confirmations,
            'organization_name': request.user.organization.name,
            'validation_status': report.validation_status.value,
            })

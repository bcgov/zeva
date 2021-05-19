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
        previous_years_exist = request.data.get('previous_years_exist')

        report = ModelYearReport.objects.get(id=model_year_report_id)

        """
        Update LDV sales
        """
        model_year_report_update = ModelYearReport.objects.filter(
            id=model_year_report_id
        )
        model_year_report_update.update(supplier_class=supplier_class)

        ModelYearReportLDVSales.objects.create(
            ldv_sales=ldv_sales,
            model_year_id=report.model_year_id,
            model_year_report_id=model_year_report_id
        )

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
        if not previous_years_exist:
            for previous_sale in previous_sales:
                model_year_report_previous_sale = ModelYearReportLDVSales.objects.create(
                    ldv_sales=previous_sale.get('ldv_sales'),
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
        queryset = self.get_queryset()
        report = get_object_or_404(queryset, pk=pk)
        previous_sales_test = []
        ldv_sales_sum = 0
        avg_sale = 0

        previous_sales = ModelYearReportLDVSales.objects.filter(
            model_year_report_id=report.id,
            model_year__name__lt=report.model_year.name
        ).order_by('-model_year__name')
        # Not complete logic, need more work
        try:
            if previous_sales.count() != 3:
                report_year = ModelYearReport.objects.values_list('model_year__name', flat=True).get(
                    id=report.id)
                previous_year = int(report_year)-1
                previous_report = ModelYearReport.objects.values_list('id', flat=True).get(
                    model_year__name=str(previous_year))

                if previous_report:
                    ldv_sales_first = ModelYearReport.objects.values_list('ldv_sales', flat=True).get(id=previous_report)

                    ldv_sales_second = ModelYearReportLDVSales.objects.values_list(
                        'ldv_sales', flat=True).get(
                            Q(model_year_report_id=previous_report) &
                            Q(model_year__name=previous_year-1))

                    ldv_sales_third = ModelYearReportLDVSales.objects.values_list(
                        'ldv_sales', flat=True).get(
                            Q(model_year_report_id=previous_report) &
                            Q(model_year__name=previous_year-2))

                    previous_sales_test.append({'model_year': previous_year, 'ldv_sales': ldv_sales_first})
                    previous_sales_test.append({'model_year': previous_year-1, 'ldv_sales': ldv_sales_second})
                    previous_sales_test.append({'model_year': previous_year-2, 'ldv_sales': ldv_sales_third})
                    avg_sale = (ldv_sales_first + ldv_sales_second + ldv_sales_third) / 3
                avg_sale = 0
            else:
                for sale in previous_sales:
                    ldv_sales_sum += sale.previous_sales
                avg_sale = ldv_sales_sum / 3
        except Exception:
            pass

        previous_sales_serializer = ModelYearReportLDVSalesSerializer(
            previous_sales, many=True)

        vehicle = ModelYearReportVehicle.objects.filter(
            model_year_report_id=report.id)
        vehicles_serializer = ModelYearReportVehicleSerializer(
            vehicle, many=True)

        ldv_sales = None

        report_ldv_sales = ModelYearReportLDVSales.objects.filter(
            model_year_id=report.model_year_id,
            model_year_report_id=report.id
        ).first()

        if report_ldv_sales:
            ldv_sales = report_ldv_sales.ldv_sales

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
            'average_sales': avg_sale
            })

from rest_framework import mixins, viewsets, permissions,status

from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.models.model_year_report import ModelYearReport
from api.models.vehicle import Vehicle
from api.models.model_year import ModelYear
from api.models.model_year_report_confirmation import ModelYearReportConfirmation
from api.models.model_year_report_previous_sales import ModelYearReportPreviousSales
from rest_framework.response import Response

from api.serializers.model_year_report_vehicle import ModelYearReportVehicleSerializer, ModelYearReportVehicleSaveSerializer


class ModelYearReportVehicleViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):

    permission_classes = (permissions.AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = ModelYearReportVehicle.objects.all()

    serializer_classes = {
        'default': ModelYearReportVehicleSerializer,
        'create': ModelYearReportVehicleSaveSerializer,
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def create(self, request, *args, **kwargs):
        vehicles = request.data.get('data')
        model_year_report_id = request.data.get('model_year_report_id')
        model_year_report_ldv_sales = request.data.get('ldv_sales')
        previous_sales = request.data.get('previous_sales')
        confirmations = request.data.get('confirmation')

        report = ModelYearReport.objects.get(id=model_year_report_id)

        """ 
        Update LDV sales
        """
        model_year_report_update = ModelYearReport.objects.filter(
            id=model_year_report_id
        )
        model_year_report_update.update(ldv_sales=model_year_report_ldv_sales)

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
        Save/Update previous years LDV sales information
        """
        previous_year_delete = ModelYearReportPreviousSales.objects.filter(
            model_year_report_id=model_year_report_id
        )

        previous_year_delete.delete()

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
            signing_authority_assertion_id=confirmation).filter(model_year_report=report)
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
           {"status":"saved"}
        )


        

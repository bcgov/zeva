from rest_framework import mixins, viewsets, permissions,status

from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.models.model_year_report import ModelYearReport
from api.models.vehicle import Vehicle
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

        vehicles_delete = ModelYearReportVehicle.objects.filter(
            model_year_report_id=model_year_report_id
        )
        vehicles_delete.delete()

        model_year_report_update = ModelYearReport.objects.filter(
            id=model_year_report_id
        )
        model_year_report_update.update(ldv_sales=model_year_report_ldv_sales)
        
        for vehicle in vehicles:
            serializer = ModelYearReportVehicleSaveSerializer(
                data=vehicle,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            model_year_report_vehicle = serializer.save()

        return Response(
           {"status":"saved"}
        )


        

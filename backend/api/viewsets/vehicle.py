from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action

from api.models.vehicle import Vehicle
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model
from api.models.vehicle_trim import Trim
from api.models.vehicle_type import Type
from api.models.model_year import ModelYear

from api.serializers.vehicle import VehicleSerializer, MakeSerializer, \
VehicleModelSerializer, ModelYearSerializer, TypeSerializer, TrimSerializer
from auditable.views import AuditableMixin


class VehicleViewSet(
    AuditableMixin, viewsets.GenericViewSet,
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin
):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = Vehicle.objects.all()

    serializer_classes = {
        'default': VehicleSerializer,
        'create': VehicleSaveSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    @action(detail=False)
    def makes(self, _request):
        """
        Get the makes
        """
        makes = Make.objects.all()
        serializer = MakeSerializer(makes, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def models(self, _request):
        """
        Get the models
        """
        models = Model.objects.all()
        serializer = VehicleModelSerializer(models, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def trims(self, _request):
        """
        Get the trims
        """
        trims = Trim.objects.all()
        serializer = TrimSerializer(trims, many=True)
        return Response(serializer.data)
        
    @action(detail=False)
    def types(self,_request):
        """
        Get the types
        """
        types = Type.objects.all()
        serializer = TypeSerializer(types, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def years(self, _request):
        """
        Get the years
        """
        years = ModelYear.objects.all()
        serializer = ModelYearSerializer(years, many=True)
        return Response(serializer.data)

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models.credit_value import CreditValue
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle, VehicleDefinitionStates
from api.models.vehicle_class import VehicleClass
from api.models.vehicle_fuel_type import FuelType
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model
from api.models.vehicle_trim import Trim
from api.serializers.vehicle import VehicleSerializer, VehicleStateChangeSerializer, VehicleSaveSerializer, \
    VehicleModelSerializer, VehicleTrimSerializer, VehicleMakeSerializer, VehicleFuelTypeSerializer, \
    ModelYearSerializer, VehicleClassSerializer
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
        'state_change': VehicleStateChangeSerializer,
        'create': VehicleSaveSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def list(self, request):
        """
        Get all the organizations
        """
        is_government = request.user.is_government
        organization_id = request.user.organization.id

        if not is_government:
            vehicles = Vehicle.objects.filter(
                make__vehicle_make_organizations__organization_id=organization_id
            )
        else:
            vehicles = self.get_queryset()

        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def makes(self, _request):
        """
        Get the makes
        """
        makes = Make.objects.all()
        serializer = VehicleMakeSerializer(makes, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def models(self, _request):
        """
        Get the models
        """
        models = Model.objects.all().order_by('name')
        serializer = VehicleModelSerializer(models, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def trims(self, _request):
        """
        Get the trims
        """
        trims = Trim.objects.all()
        serializer = VehicleTrimSerializer(trims, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def fuel_types(self, _request):
        """
        Get the types
        """
        fuel_types = FuelType.objects.all().order_by('description')
        serializer = VehicleFuelTypeSerializer(fuel_types, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def classes(self, _request):
        """
        Get the fuel classes
        """
        classes = VehicleClass.objects.all().order_by('description')
        serializer = VehicleClassSerializer(classes, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def years(self, _request):
        """
        Get the years
        """
        years = ModelYear.objects.all().order_by('-effective_date')
        serializer = ModelYearSerializer(years, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def state_change(self, request, pk=None):
        """
        Update the state of a vehicle
        """
        serializer = self.get_serializer(
            self.queryset.get(id=pk),
            data=request.data
        )

        if not serializer.is_valid():
            return Response(serializer.errors)

        serializer.save()

        return Response(serializer.data)

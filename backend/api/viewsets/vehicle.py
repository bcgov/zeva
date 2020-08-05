import uuid

from django.utils.decorators import method_decorator

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.decorators.permission import permission_required
from api.models.vehicle_class import VehicleClass
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle, VehicleDefinitionStatuses
from api.models.vehicle_zev_type import ZevType
from api.serializers.vehicle import ModelYearSerializer, \
    VehicleZevTypeSerializer, VehicleClassSerializer, \
    VehicleSaveSerializer, VehicleSerializer, \
    VehicleStatusChangeSerializer
from api.services.minio import minio_put_object
from auditable.views import AuditableMixin


class VehicleViewSet(
    AuditableMixin, viewsets.GenericViewSet, mixins.CreateModelMixin,
    mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin
):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = Vehicle.objects.all()

    serializer_classes = {
        'default': VehicleSerializer,
        'state_change': VehicleStatusChangeSerializer,
        'create': VehicleSaveSerializer,
        'partial_update': VehicleSaveSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def get_queryset(self):
        request = self.request

        queryset = Vehicle.objects.filter(
            organization_id=request.user.organization.id
        )

        if request.user.is_government:
            queryset = Vehicle.objects.filter(
                validation_status__in=[
                    VehicleDefinitionStatuses.SUBMITTED,
                    VehicleDefinitionStatuses.VALIDATED,
                    VehicleDefinitionStatuses.REJECTED,
                    VehicleDefinitionStatuses.CHANGES_REQUESTED
                ]
            )

            organization_id = request.query_params.get('organization_id', None)

            if organization_id:
                queryset = queryset.filter(organization_id=organization_id)

        return queryset

    @method_decorator(permission_required('VIEW_ZEV'))
    def list(self, request):
        """
        Get all the organizations
        """
        vehicles = self.get_queryset()

        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def zev_types(self, _request):
        """
        Get the types
        """
        zev_types = ZevType.objects.all().order_by('description')

        serializer = VehicleZevTypeSerializer(zev_types, many=True)
        return Response(serializer.data)

    @action(detail=False)	
    def classes(self, _request):
        """
        Get the zev classes
        """
        classes = VehicleClass.objects.all().order_by('description')
        serializer = VehicleClassSerializer(classes, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def classes(self, _request):
        """
        Get the zev classes
        """
        classes = VehicleClass.objects.all().order_by('description')
        serializer = VehicleClassSerializer(classes, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def years(self, _request):
        """
        Get the years
        """
        years = ModelYear.objects.all().order_by('-name')
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

        if not serializer.is_valid(raise_exception=True):
            return Response(serializer.errors)

        serializer.save()

        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def minio_url(self, request, pk=None):
        object_name = uuid.uuid4().hex
        url = minio_put_object(object_name)

        return Response({
            'url': url,
            'minio_object_name': object_name
        })

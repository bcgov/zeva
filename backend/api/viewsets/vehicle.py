from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models.vehicle import Vehicle
from api.serializers.vehicle import VehicleSerializer, VehicleStateChangeSerializer
from auditable.views import AuditableMixin


class VehicleViewSet(
    AuditableMixin, viewsets.GenericViewSet,
    mixins.ListModelMixin, mixins.RetrieveModelMixin
):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = Vehicle.objects.all()

    serializer_classes = {
        'default': VehicleSerializer,
        'state_change': VehicleStateChangeSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

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

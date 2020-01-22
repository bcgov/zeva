from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models.credit_value import CreditValue
from api.models.vehicle import Vehicle
from api.serializers.vehicle import VehicleSerializer, VehicleSaveSerializer
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

    def list(self, request):
        """
        Get all the organizations
        """
        is_government = request.user.is_government
        organization_id = request.user.organization.id

        if not is_government:
            vehicles = Vehicle.objects.filter(
                organization_id=organization_id
            )
        else:
            vehicles = self.get_queryset()

        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

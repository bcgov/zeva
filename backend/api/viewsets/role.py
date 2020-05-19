from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.services.keycloak_api import list_roles, get_token, list_groups

from api.models.role import Role
from api.serializers.role import RoleSerializer


class RoleViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):

    permission_classes = (AllowAny,)
    http_method_names = ['get']
    queryset = Role.objects.all()

    serializer_classes = {
        'default': RoleSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

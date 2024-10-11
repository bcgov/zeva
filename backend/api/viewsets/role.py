from rest_framework import mixins, viewsets

from api.models.role import Role
from api.permissions.role import RolePermissions
from api.serializers.role import RoleSerializer


class RoleViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):

    permission_classes = (RolePermissions,)
    http_method_names = ['get']

    def get_queryset(self):
        return Role.objects.all()

    serializer_classes = {
        'default': RoleSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

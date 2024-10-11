from rest_framework import mixins, viewsets
from api.permissions.user import UserPermissions
from api.models.organization import Organization
from api.serializers.dashboard import DashboardListSerializer
from auditable.views import AuditableMixin


class DashboardViewset(
        AuditableMixin, viewsets.GenericViewSet, 
        mixins.ListModelMixin
):
    """
    This viewset automatically provides the "list" action
    """
    permission_classes = (UserPermissions,)
    http_method_names = ['get']
    
    def get_queryset(self):
        request = self.request
        queryset = Organization.objects.filter(
            id=request.user.organization.id
        )
        return queryset

    serializer_classes = {
        'default': DashboardListSerializer,
        'list': DashboardListSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models.user_profile import UserProfile
from api.permissions.user import UserPermissions
from api.models.model_year_report import ModelYearReport
from api.serializers.dashboard import DashboardListSerializer
from auditable.views import AuditableMixin


class DashboardViewset(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.CreateModelMixin, mixins.ListModelMixin,
        mixins.UpdateModelMixin, mixins.RetrieveModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = (UserPermissions,)
    http_method_names = ['get']
    queryset = ModelYearReport.objects.all()

    serializer_classes = {
        'default': DashboardListSerializer,
        'list': DashboardListSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']
from rest_framework import mixins, viewsets

from api.models.model_year_report import ModelYearReport
from api.permissions.model_year_report import ModelYearReportPermissions
from auditable.views import AuditableMixin


class ModelYearReportViewset(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.ListModelMixin, mixins.RetrieveModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = (ModelYearReportPermissions,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'default': ModelYearReportSerializer,
        'list': ModelYearReportListSerializer,
    }

    def get_queryset(self):
        request = self.request

        queryset = ModelYearReport.objects.filter(
            organization_id=request.user.organization.id
        )

        return queryset

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

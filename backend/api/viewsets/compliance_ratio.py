from rest_framework import mixins, viewsets, permissions

from api.models.compliance_ratio import ComplianceRatio

from api.serializers.compliance_ratio import ComplianceRatioSerializer


class ComplianceRatioViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):

    permission_classes = (permissions.AllowAny,)
    http_method_names = ['get']
    queryset = ComplianceRatio.objects.all()

    serializer_classes = {
        'default': ComplianceRatioSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

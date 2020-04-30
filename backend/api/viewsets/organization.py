from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models.organization import Organization
from api.serializers.organization import \
    OrganizationSerializer, OrganizationWithMembersSerializer\
    , OrganizationSaveSerializer
from auditable.views import AuditableMixin


class OrganizationViewSet(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.CreateModelMixin, mixins.ListModelMixin,
        mixins.UpdateModelMixin, mixins.RetrieveModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = Organization.objects.all()

    serializer_classes = {
        'default': OrganizationSerializer,
        'mine': OrganizationWithMembersSerializer,
        'update': OrganizationSaveSerializer,
        'partial_update': OrganizationSaveSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def list(self, request):
        """
        Get all the organizations
        """
        organizations = Organization.objects.filter(
            is_government=False
        ).order_by('name')

        serializer = self.get_serializer(organizations, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def mine(self, request):
        """
        Get the organization of the user
        """
        organization = request.user.organization
        serializer = self.get_serializer(organization)

        return Response(serializer.data)

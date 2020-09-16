from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models.user_profile import UserProfile
from api.permissions.user import UserPermissions
from api.serializers.user import UserSerializer, UserSaveSerializer
from auditable.views import AuditableMixin


class UserViewSet(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.CreateModelMixin, mixins.ListModelMixin,
        mixins.UpdateModelMixin, mixins.RetrieveModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = (UserPermissions,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = UserProfile.objects.all()

    serializer_classes = {
        'default': UserSerializer,
        'create': UserSaveSerializer,
        'partial_update': UserSaveSerializer,
        'update': UserSaveSerializer,
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    @action(detail=False)
    def current(self, request):
        """
        Get the current user
        """
        serializer = self.get_serializer(request.user)

        return Response(serializer.data)

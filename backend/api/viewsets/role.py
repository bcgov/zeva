from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.decorators.authorization import authorization_required
from api.services.keycloak_api import list_roles, get_token


class RoleViewSet(viewsets.ViewSet):

    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']

    @authorization_required('view_roles')
    def list(self, request):
        """
        Get all the roles
        """
        request.user.roles

        return Response(list_roles(get_token()))

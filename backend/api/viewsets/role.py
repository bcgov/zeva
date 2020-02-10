from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.decorators.authorization import authorization_required
from api.services.keycloak_api import list_roles, get_token, list_groups


class RoleViewSet(viewsets.ViewSet):

    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']

    @authorization_required('View Roles and Permissions')
    def list(self, request):
        """
        Get all the roles
        """
        return Response(list_groups(get_token()))

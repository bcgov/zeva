from django.utils.decorators import method_decorator
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.decorators.permission import permission_required
from api.models.organization import Organization
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.sales_submission import SalesSubmissionListSerializer
from api.serializers.organization import \
    OrganizationSerializer, OrganizationWithMembersSerializer, \
    OrganizationSaveSerializer
from api.permissions.organization import OrganizationPermissions
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
    permission_classes = (OrganizationPermissions,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'default': OrganizationSerializer,
        'mine': OrganizationWithMembersSerializer,
        'update': OrganizationSaveSerializer,
        'create': OrganizationSaveSerializer,
        'partial_update': OrganizationSaveSerializer,
        'sales': SalesSubmissionListSerializer,
        'users': OrganizationWithMembersSerializer,
    }

    def get_queryset(self):
        request = self.request

        if request.user.is_government:
            queryset = Organization.objects.all()
        else:
            queryset = Organization.objects.filter(
                id=request.user.organization.id
            )

        return queryset

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

    @action(detail=True)
    @method_decorator(permission_required('VIEW_USERS'))
    def users(self, request, pk=None):
        """
        Get the organization with its users
        """
        organization = self.get_object()
        if not request.user.is_government:
            organization = Organization.objects.get(
                id=request.user.organization.id
            )

        serializer = self.get_serializer(organization)

        return Response(serializer.data)

    @action(detail=True)
    @method_decorator(permission_required('VIEW_SALES'))
    def sales(self, request, pk=None):
        """
        Get the sales submissions of a specific organization
        """
        if not request.user.is_government:
            return Response(None)

        sales = SalesSubmission.objects.filter(
            organization_id=pk
        ).exclude(validation_status__in=(
            SalesSubmissionStatuses.DRAFT,
            SalesSubmissionStatuses.NEW
        ))

        serializer = SalesSubmissionListSerializer(sales, many=True)

        return Response(serializer.data)

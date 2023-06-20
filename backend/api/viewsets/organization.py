from django.utils.decorators import method_decorator
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.decorators.permission import permission_required
from api.models.organization import Organization
from api.models.organization_ldv_sales import OrganizationLDVSales
from api.models.sales_submission import SalesSubmission
from api.serializers.credit_transaction import CreditTransactionListSerializer, \
    CreditTransactionBalanceSerializer
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.sales_submission import SalesSubmissionListSerializer
from api.serializers.organization import \
    OrganizationSerializer, OrganizationWithMembersSerializer, \
    OrganizationSaveSerializer
from api.serializers.organization_ldv_sales import \
    OrganizationLDVSalesSerializer
from api.services.credit_transaction import aggregate_credit_balance_details, \
    aggregate_transactions_by_submission
from api.permissions.organization import OrganizationPermissions
from auditable.views import AuditableMixin
from api.services.credit_transaction import (
    get_current_compliance_period_split_date,
    get_credit_transactions_queryset_by_date,
)
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_statuses import ModelYearReportStatuses


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
        'ldv_sales': OrganizationLDVSalesSerializer,
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
            SalesSubmissionStatuses.DELETED,
            SalesSubmissionStatuses.DRAFT,
            SalesSubmissionStatuses.NEW,
        ))

        serializer = SalesSubmissionListSerializer(
            sales, many=True, context={'request': request}
        )

        return Response(serializer.data)

    @action(detail=True)
    @method_decorator(permission_required('VIEW_SALES'))
    def supplier_balance(self, request, pk=None):
        if not request.user.is_government:
            return Response(None)

        compliance_period_split_date = get_current_compliance_period_split_date()
        queryset = get_credit_transactions_queryset_by_date(compliance_period_split_date, "gte")
        balances = aggregate_credit_balance_details(pk, queryset)

        serializer = CreditTransactionBalanceSerializer(balances, many=True)

        response = {
            "balances": serializer.data,
            "compliance_year": compliance_period_split_date.year
        }

        return Response(response)

    @action(detail=True)
    @method_decorator(permission_required('VIEW_SALES'))
    def supplier_transactions(self, request, pk=None):
        """
        Get the list of transactions of a specific organization
        """
        if not request.user.is_government:
            return Response(None)

        transactions = aggregate_transactions_by_submission(pk)

        serializer = CreditTransactionListSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch', 'put'])
    @method_decorator(permission_required('VIEW_SALES'))
    def ldv_sales(self, request, pk=None):
        delete_id = request.data.get('id', None)
        if not request.user.is_government:
            return Response(None)

        organization = self.get_object()
        if delete_id:
            sale = OrganizationLDVSales.objects.filter(id=delete_id).first()
            sale.delete()
        else:
            serializer = OrganizationLDVSalesSerializer(
                data=request.data,
                context={
                    'organization': organization,
                    'request': request
                }
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

        ldv_sales = OrganizationLDVSales.objects.filter(
            organization_id=pk
        ).order_by('-model_year__name')

        serializer = OrganizationLDVSalesSerializer(ldv_sales, many=True)

        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def most_recent_myr_id(self, request, pk=None):
        response = None
        model_year_report = (
            ModelYearReport.objects.only("id")
            .filter(organization=pk)
            .filter(
                validation_status__in=[
                    ModelYearReportStatuses.ASSESSED,
                    ModelYearReportStatuses.REASSESSED,
                ]
            )
            .order_by("-create_timestamp")
            .first()
        )
        if model_year_report:
            response = model_year_report.id
        return Response(response)

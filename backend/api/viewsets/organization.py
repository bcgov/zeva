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
    OrganizationSaveSerializer, OrganizationNameSerializer
from api.serializers.organization_ldv_sales import \
    OrganizationLDVSalesSerializer
from api.permissions.organization import OrganizationPermissions
from auditable.views import AuditableCreateMixin, AuditableUpdateMixin
from api.services.supplemental_report import get_map_of_model_year_report_ids_to_latest_supplemental_ids
from api.services.credit_transaction import (
    aggregate_credit_balance_details,
    aggregate_transactions_by_submission,
    get_credit_transactions_q_obj_by_date,
    get_compliance_years,
    get_compliance_period_bounds,
    get_timestamp_of_most_recent_reduction
)
from api.services.model_year_report import (
    get_most_recent_myr_id,
    get_most_recent_supplemental
)
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.services.model_year import get_model_years
from api.serializers.vehicle import ModelYearSerializer


class OrganizationViewSet(
        viewsets.GenericViewSet,
        AuditableCreateMixin, 
        AuditableUpdateMixin,
        mixins.RetrieveModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = [OrganizationPermissions]
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

        serializer = OrganizationNameSerializer
        if request.user.is_government:
            serializer = OrganizationSerializer
        
        return Response(serializer(organizations, many=True).data)

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
    def recent_supplier_balance(self, request, pk=None):
        if not request.user.is_government:
            return Response(None)

        timestamp = get_timestamp_of_most_recent_reduction(pk)
        q_obj = None
        if timestamp:
            q_obj = get_credit_transactions_q_obj_by_date(timestamp, "gt")
        if q_obj:
            balances = aggregate_credit_balance_details(pk, q_obj)
        else:
            balances = aggregate_credit_balance_details(pk)

        serializer = CreditTransactionBalanceSerializer(balances, many=True)
        return Response(serializer.data)

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

    @action(detail=True, methods=['put'])
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
    
    @action(detail=True, methods=['get'])
    def assessed_supplementals_map(self, request, pk=None):
        result = get_map_of_model_year_report_ids_to_latest_supplemental_ids(pk, ModelYearReportStatuses.ASSESSED, ModelYearReportStatuses.REASSESSED)
        return Response(result)
        

    @action(detail=True, methods=["get"])
    def most_recent_myr_id(self, request, pk=None):
        model_year_report = get_most_recent_myr_id(pk, ModelYearReportStatuses.ASSESSED, ModelYearReportStatuses.REASSESSED)
        if model_year_report:
            supplemental = get_most_recent_supplemental(model_year_report.id, ModelYearReportStatuses.ASSESSED, ModelYearReportStatuses.REASSESSED)
            if supplemental:
                return Response({
                    "is_supplementary": True,
                    "id": supplemental.id
                })
            return Response({
                "is_supplementary": False,
                "id": model_year_report.id
            })
        return Response(None)
    
    @action(detail=True, methods=['get'])
    def compliance_years(self, request, pk=None):
        compliance_years = get_compliance_years(pk)
        return Response(compliance_years)
    
    @action(detail=True, methods=['get'])
    @method_decorator(permission_required('VIEW_SALES'))
    def list_by_year(self, request, pk=None):
        if not request.user.is_government:
            return Response([])
        compliance_year = request.GET.get('year', None)
        if compliance_year:
            compliance_period_bounds = get_compliance_period_bounds(compliance_year)
            q_obj_1 = get_credit_transactions_q_obj_by_date(compliance_period_bounds[0], "gte")
            q_obj_2 = get_credit_transactions_q_obj_by_date(compliance_period_bounds[1], "lte")
            transactions = aggregate_transactions_by_submission(pk, q_obj_1, q_obj_2)
            serializer = CreditTransactionListSerializer(transactions, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=True, methods=['get'])
    def model_years(self, request, pk=None):
        model_years = get_model_years()
        serializer = ModelYearSerializer(model_years, many=True)
        return Response(serializer.data)

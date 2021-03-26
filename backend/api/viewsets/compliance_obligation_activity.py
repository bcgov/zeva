from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from django.db.models import  Q
from rest_framework.response import Response
from api.decorators.permission import permission_required
from django.utils.decorators import method_decorator
from api.models.model_year_report import ModelYearReport
from api.models.credit_transaction import CreditTransaction
from api.permissions.model_year_report import ModelYearReportPermissions
from api.serializers.model_year_report import \
    ModelYearReportSerializer, ModelYearReportListSerializer, \
    ModelYearReportSaveSerializer
from auditable.views import AuditableMixin
from api.serializers.compliance_obligation_activity import ComplianceObligationActivityDetailsSerializer, ComplianceObligationActivitySaveSerializer
from api.serializers.organization import \
    OrganizationSerializer
class ComplianceObligationActivityViewset(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.ListModelMixin, mixins.RetrieveModelMixin,
        mixins.CreateModelMixin, mixins.UpdateModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = (ModelYearReportPermissions,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'create': ComplianceObligationActivitySaveSerializer,
        'default': ComplianceObligationActivityDetailsSerializer,
        'details': ComplianceObligationActivityDetailsSerializer
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


    @action(detail=False, url_path=r'(?P<year>\d+)')
    @method_decorator(permission_required('VIEW_SALES'))
    def details(self, request, *args, **kwargs):
        organization = request.user.organization
        transactions = CreditTransaction.objects.filter(
        Q(credit_to=organization) | Q(debit_from=organization)
        )
        year = kwargs.get('year')
        serializer = ComplianceObligationActivityDetailsSerializer(transactions, context={'request': request, 'kwargs': kwargs})

        return Response(serializer.data)
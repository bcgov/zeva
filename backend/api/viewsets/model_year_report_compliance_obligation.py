from rest_framework import mixins, viewsets, permissions
from rest_framework.decorators import action
from django.db.models import  Q
from django.utils.decorators import method_decorator
from rest_framework.serializers import ModelSerializer, \
    SlugRelatedField
from rest_framework.response import Response
from api.decorators.permission import permission_required
from auditable.views import AuditableMixin
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.credit_transaction import CreditTransaction
from api.models.model_year_report_credit_offset import ModelYearReportCreditOffset
from api.models.model_year_report_compliance_obligation import ModelYearReportComplianceObligation
from api.permissions.model_year_report import ModelYearReportPermissions
from api.serializers.model_year_report import \
    ModelYearReportSerializer, ModelYearReportListSerializer, \
    ModelYearReportSaveSerializer
from api.serializers.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligationDetailsSerializer,  \
    ModelYearReportComplianceObligationSaveSerializer
from api.serializers.organization import \
    OrganizationSerializer
from api.serializers.vehicle import ModelYearSerializer

class ModelYearReportComplianceObligationViewset(
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
        'default': ModelYearReportComplianceObligationDetailsSerializer,
        'details': ModelYearReportComplianceObligationDetailsSerializer,
        # 'create': ModelYearReportComplianceObligationSaveSerializer
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

    def create(self, request, *args, **kwargs):
        id = request.data.get('report_id')
        offset = request.data.get('offset')
        credit_activity = request.data.get('credit_activity')
        for year, value in offset.items():
            model_year = ModelYear.objects.get(name=year)
            if value['a'] > 0 or value['b'] > 0:
                obj = ModelYearReportCreditOffset.objects.create(
                    model_year_report_id=id,
                    model_year=model_year,
                    credit_a_offset_value=value['a'],
                    credit_b_offset_value=value['b']
                )
                obj.save()
        for each in credit_activity:
            category = each['category']
            model_year = ModelYear.objects.get(name=each['year'])
            a = each['a']
            b = each['b']
            compliance_obj = ModelYearReportComplianceObligation.objects.create(
                    model_year_report_id=id,
                    model_year=model_year,
                    category=category,
                    credit_a_value=a,
                    credit_b_value=b
                )
            compliance_obj.save()
        return Response(id)

    @action(detail=False, url_path=r'(?P<year>\d+)')
    @method_decorator(permission_required('VIEW_SALES'))
    def details(self, request, *args, **kwargs):
        organization = request.user.organization
        transactions = CreditTransaction.objects.filter(
          Q(credit_to=organization) | Q(debit_from=organization)
        )
        year = kwargs.get('year')
        serializer = ModelYearReportComplianceObligationDetailsSerializer(transactions, context={'request': request, 'kwargs': kwargs})

        return Response(serializer.data)
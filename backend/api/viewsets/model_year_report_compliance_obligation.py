from datetime import date
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils.decorators import method_decorator

from auditable.views import AuditableMixin
from api.decorators.permission import permission_required
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.credit_transaction import CreditTransaction
from api.models.model_year_report_credit_offset import ModelYearReportCreditOffset
from api.models.model_year_report_compliance_obligation import ModelYearReportComplianceObligation
from api.models.sales_submission import SalesSubmission
from api.models.vehicle import Vehicle
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.permissions.model_year_report import ModelYearReportPermissions
from api.serializers.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligationDetailsSerializer, ModelYearReportComplianceObligationSnapshotSerializer, ModelYearReportComplianceObligationOffsetSerializer
from api.serializers.credit_transaction import CreditTransactionObligationActivitySerializer
from api.services.summary import parse_summary_serializer, retrieve_balance


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
        confirmations = request.data.get('confirmations')
        for confirmation in confirmations:
            ModelYearReportConfirmation.objects.create(
                create_user=request.user.username,
                model_year_report_id=id,
                has_accepted=True,
                title=request.user.title,
                signing_authority_assertion_id=confirmation
            )
        ModelYearReportCreditOffset.objects.filter(
            model_year_report_id=id
        ).delete()
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
        ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=id
        ).delete()
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

    @action(detail=False, url_path=r'(?P<id>\d+)')
    @method_decorator(permission_required('VIEW_SALES'))
    def details(self, request, *args, **kwargs):
        organization = request.user.organization
        id = kwargs.get('id')
        report = ModelYearReport.objects.get(
            id=id
        )
        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=report.id,
            signing_authority_assertion__module="compliance_obligation"
        ).first()
        snapshot = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=report.id,
        ).order_by('-update_timestamp')
        offset_snapshot = ModelYearReportCreditOffset.objects.filter(
            model_year_report_id=report.id,
        ).order_by('-update_timestamp')
        compliance_offset = None
        if offset_snapshot:
            offset_serializer = ModelYearReportComplianceObligationOffsetSerializer(
                offset_snapshot, context={'request': request, 'kwargs': kwargs}, many=True
            )
            compliance_offset = offset_serializer.data
            
        if confirmation and snapshot:
            serializer = ModelYearReportComplianceObligationSnapshotSerializer(
                snapshot, context={'request': request, 'kwargs': kwargs}, many=True
            )
        else:
            # transactions = CreditTransaction.objects.filter(
            #     Q(credit_to=organization) | Q(debit_from=organization)
            # )
            # serializer = ModelYearReportComplianceObligationDetailsSerializer(
            #     transactions, context={'request': request, 'kwargs': kwargs}
            # )
            report = ModelYearReport.objects.get(
                id=id
            )
            report_year_obj = ModelYear.objects.get(
                id=report.model_year_id
            )
            report_year = int(report_year_obj.name)
            from_date = None
            to_date = None

            if report_year == 2020:
                from_date = date(2018, 1, 2,)
                to_date = date(report_year + 1, 9, 30,)
            else:
                from_date = date(report_year, 10, 1,)
                to_date = date(report_year + 1, 9, 30,)

            content = []

            transfers_in = CreditTransaction.objects.filter(
                credit_to=request.user.organization,
                transaction_type__transaction_type='Credit Transfer',
                transaction_timestamp__lte=to_date,
                transaction_timestamp__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
                'credit_class_id', 'model_year_id'
            )

            transfers_out = CreditTransaction.objects.filter(
                debit_from=request.user.organization,
                transaction_type__transaction_type='Credit Transfer',
                transaction_timestamp__lte=to_date,
                transaction_timestamp__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(total_value=Sum(
                'total_value')
            ).order_by(
                'credit_class_id', 'model_year_id'
            )

            credits_issued_sales = CreditTransaction.objects.filter(
                credit_to=request.user.organization,
                transaction_type__transaction_type='Validation',
                transaction_timestamp__lte=to_date,
                transaction_timestamp__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
                'credit_class_id', 'model_year_id'
            )

            transfers_in_serializer = CreditTransactionObligationActivitySerializer(transfers_in, read_only=True, many=True)
            transfers_out_serializer = CreditTransactionObligationActivitySerializer(transfers_out, read_only=True, many=True)
            credit_sales_serializer = CreditTransactionObligationActivitySerializer(credits_issued_sales, read_only=True, many=True)

            for transfer_in in transfers_in_serializer.data:
                parse_summary_serializer(content, transfer_in, 'transfersIn')

            for transfer_out in transfers_out_serializer.data:
                parse_summary_serializer(content, transfer_out, 'transfersOut')

            for credits_sale in credit_sales_serializer.data:
                parse_summary_serializer(content, credits_sale, 'creditsIssuedSales')

            pending_sales_submissions = SalesSubmission.objects.filter(
                organization=request.user.organization,
                validation_status__in=['SUBMITTED', 'RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'CHECKED'],
                submission_date__lte=to_date,
                submission_date__gte=from_date,
            )

            totals = {}
            for obj in pending_sales_submissions:
                for record in obj.get_content_totals_by_vehicles():
                    try:
                        model_year = float(record['xls_model_year'])
                    except ValueError:
                        continue
                    vehicle = Vehicle.objects.filter(
                        make__iexact=record['xls_make'],
                        model_name=record['xls_model'],
                        model_year__name=int(model_year),
                        validation_status=VehicleDefinitionStatuses.VALIDATED,
                    ).first()
                    if vehicle:
                        model_year_str = str(int(model_year))
                        if model_year_str not in totals.keys():
                            totals[model_year_str] = {'A': 0, 'B': 0}
                        totals[model_year_str][vehicle.get_credit_class()] += vehicle.get_credit_value() * record['num_vins']

            for key in totals:
                content.append({
                    'credit_a_value': totals[key].get('A'),
                    'credit_b_value': totals[key].get('B'),
                    'category': 'pendingBalance',
                    'model_year': {'name': key}
                })

            prior_year = report_year-1
            prior_year_balance_a = retrieve_balance(organization.id, prior_year, 'A')
            prior_year_balance_b = retrieve_balance(organization.id, prior_year, 'B')
            content.append({
                'credit_a_value': prior_year_balance_a,
                'credit_b_value': prior_year_balance_b,
                'category': 'creditBalanceStart',
                'model_year': {'name': report_year_obj.name}
            })

            report_year_balance_a = retrieve_balance(organization.id, report_year, 'A')
            report_year_balance_b = retrieve_balance(organization.id, report_year, 'B')   
            content.append({
                'credit_a_value': report_year_balance_a,
                'credit_b_value': report_year_balance_b,
                'category': 'creditBalanceEnd',
                'model_year': {'name': report_year_obj.name}
            })

            return Response({
                'compliance_obligation': content,
                'compliance_offset': compliance_offset
            })

        return Response({
            'compliance_obligation': serializer.data,
            'compliance_offset': compliance_offset
         })

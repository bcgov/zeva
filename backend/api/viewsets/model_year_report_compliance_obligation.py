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
from api.models.model_year_report_credit_offset import \
    ModelYearReportCreditOffset
from api.models.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligation
from api.models.sales_submission import SalesSubmission
from api.models.vehicle import Vehicle
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.permissions.model_year_report import ModelYearReportPermissions
from api.serializers.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligationDetailsSerializer, \
    ModelYearReportComplianceObligationSnapshotSerializer, \
    ModelYearReportComplianceObligationOffsetSerializer
from api.serializers.credit_transaction import \
    CreditTransactionObligationActivitySerializer
from api.services.summary import parse_summary_serializer, retrieve_balance, \
    get_current_year_balance
from api.models.model_year_report_ldv_sales import \
    ModelYearReportLDVSales


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
        credit_activity = request.data.get('credit_activity')
        confirmations = request.data.get('confirmations')
        sales = request.data.get('sales', None)
        credit_reduction_selection = request.data.get('credit_reduction_selection', None)

        if sales:
            model_year = ModelYearReport.objects.values_list(
                'model_year_id', flat=True
            ).filter(id=id).first()

            if model_year:
                ModelYearReportLDVSales.objects.update_or_create(
                    model_year_id=model_year,
                    model_year_report_id=id,
                    from_gov=False,
                    defaults={
                        'ldv_sales': sales,
                        'create_user': request.user.username,
                        'update_user': request.user.username
                    }
                )

        for confirmation in confirmations:
            ModelYearReportConfirmation.objects.create(
                create_user=request.user.username,
                model_year_report_id=id,
                has_accepted=True,
                title=request.user.title,
                signing_authority_assertion_id=confirmation
            )
        ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=id
        ).delete()
        for each in credit_activity:
            print(each)
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

        if credit_reduction_selection:
            report = ModelYearReport.objects.get(
                id=id
            )

            report.credit_reduction_selection = credit_reduction_selection
            report.save()

        return Response(id)

    @action(detail=False, url_path=r'(?P<id>\d+)')
    @method_decorator(permission_required('VIEW_SALES'))
    def details(self, request, *args, **kwargs):
        summary_param = request.GET.get('summary', None)
        summary = True if summary_param == "true" else None

        issued_credits = []
        obj_a = None
        obj_b = None

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

        is_assessment = request.GET.get('assessment') == 'True' and request.user.is_government

        if is_assessment:
            organization = report.organization

        if (not confirmation and not summary) or is_assessment or not snapshot:
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
                credit_to=organization,
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
                debit_from=organization,
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
                credit_to=organization,
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
                # if credits_sale['credit_class'].get('credit_class') == 'A':
                #     obj_a = {'model_year': credits_sale['model_year']['name'], 'A': credits_sale['total_value'], 'B': 0}
                #     issued_credits.append(obj_a)
                # if credits_sale['credit_class'].get('credit_class') == 'B':
                #     obj_b = {'model_year': credits_sale['model_year']['name'], 'A': 0, 'B': credits_sale['total_value']}
                #     issued_credits.append(obj_b)
            # if obj_a and obj_b and obj_a['model_year'] == obj_b['model_year']:
            #     issued_credits.append({'model_year': obj_a['model_year'], 'A': obj_a['A'], 'B': obj_b['B']})
            #     issued_credits.remove({'model_year': obj_a['model_year'], 'A': obj_a['A'], 'B': 0})
            #     issued_credits.remove({'model_year': obj_b['model_year'], 'A': 0, 'B': obj_b['B']})
                
            # content.append({"issued_credits": issued_credits, 'category': 'creditsIssuedSales'})

            pending_sales_submissions = SalesSubmission.objects.filter(
                organization=organization,
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

            previous_report = None
            prior_year_balance_a = 0
            prior_year_balance_b = 0
            prior_year = report_year - 1
            previous_report = ModelYearReport.objects.values_list('id', flat=True).filter(
                    model_year__name=str(prior_year)).filter(organization_name=organization.name).first()

            if previous_report:
                prior_year_balance_a = ModelYearReportComplianceObligation.objects.values_list('credit_a_value', flat=True).filter(
                        model_year_report_id=previous_report).filter(category='creditBalanceEnd').first()

                prior_year_balance_b = ModelYearReportComplianceObligation.objects.values_list('credit_b_value', flat=True).filter(
                        model_year_report_id=previous_report).filter(category='creditBalanceEnd').first()

            content.append({
                'credit_a_value': prior_year_balance_a if prior_year_balance_a else 0,
                'credit_b_value': prior_year_balance_b if prior_year_balance_b else 0,
                'category': 'creditBalanceStart',
                'model_year': {'name': report_year_obj.name}
            })

            report_year_balance_a = get_current_year_balance(organization.id, report_year, 'A')
            report_year_balance_b = get_current_year_balance(organization.id, report_year, 'B')

            prior_year_activity_balance_a = get_current_year_balance(organization.id, prior_year, 'A')
            prior_year_activity_balance_b = get_current_year_balance(organization.id, prior_year, 'B')

            content.append({
                'credit_a_value': report_year_balance_a,
                'credit_b_value': report_year_balance_b,
                'category': 'creditBalanceEnd',
                'model_year': {'name': report_year_obj.name}
            })

            content.append({
                'credit_a_value': prior_year_balance_a + prior_year_activity_balance_a,
                'credit_b_value': prior_year_balance_b + prior_year_activity_balance_b,
                'category': 'creditBalanceEnd',
                'model_year': {'name': prior_year}
            })

            serializer = ModelYearReportComplianceObligationSnapshotSerializer(
                report.get_credit_reductions(prior_year), context={
                    'request': request,
                    'kwargs': kwargs
                }, many=True
            )

            return Response({
                'compliance_obligation': content + serializer.data,
                'compliance_offset': compliance_offset,
                'ldv_sales': report.ldv_sales
            })
        else:
            serializer = ModelYearReportComplianceObligationSnapshotSerializer(
                snapshot, context={'request': request, 'kwargs': kwargs}, many=True
            )

        return Response({
            'compliance_obligation': serializer.data,
            'compliance_offset': compliance_offset,
            'ldv_sales': report.ldv_sales
         })

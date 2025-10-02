from datetime import date
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Sum
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404

from api.decorators.permission import permission_required
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.credit_transaction import CreditTransaction
from api.models.model_year_report_credit_offset import \
    ModelYearReportCreditOffset
from api.models.model_year_report_statuses import \
    ModelYearReportStatuses
from api.models.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligation
from api.models.supplemental_report_credit_activity import \
    SupplementalReportCreditActivity
from api.models.sales_submission import SalesSubmission
from api.models.vehicle import Vehicle
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.models.credit_agreement_transaction_types import \
    CreditAgreementTransactionTypes
from api.models.model_year_report_ldv_sales import \
    ModelYearReportLDVSales
from api.permissions.model_year_report import ModelYearReportPermissions
from api.serializers.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligationSnapshotSerializer, \
    ModelYearReportComplianceObligationOffsetSerializer
from api.serializers.credit_transaction import \
    CreditTransactionObligationActivitySerializer
from api.services.summary import parse_summary_serializer, \
    get_current_year_balance
from api.models.organization_deficits import OrganizationDeficits
from api.services.supplemental_report import (
    get_latest_assessed_supplemental, 
    get_previous_reassessment_credit_activity,
    get_reassessment_credit_activity
)
from api.services.model_year_report_ldv_sales import get_most_recent_ldv_sales
from api.permissions.same_organization import SameOrganizationPermissions
from api.models.supplemental_report import SupplementalReport
from api.serializers.model_year_report_supplemental import ModelYearReportSupplementalCreditActivitySerializer


class ModelYearReportComplianceObligationViewset(viewsets.GenericViewSet):
    permission_classes = [SameOrganizationPermissions & ModelYearReportPermissions]
    same_org_permissions_context = {
        "default_manager": ModelYearReport.objects,
        "default_path_to_org": ("organization",),
        "custom_pk_actions": {
            "reassessment_credit_activity": {
                "manager": SupplementalReport.objects,
                "path_to_org": ("model_year_report", "organization")
            }
        }
    }
    http_method_names = ['get', 'post', 'patch']

    def get_queryset(self):
        request = self.request
        queryset = ModelYearReport.objects.filter(
            organization_id=request.user.organization.id
        )
        return queryset

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

    @action(detail=True, methods=['patch'])
    def update_obligation(self, request, pk=None):
        id = pk
        credit_activity = request.data.get('credit_activity')
        records = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=id,
            from_gov=True
        )
        if records:
            records.delete()
        for each in credit_activity:
            category = each['category']
            model_year = ModelYear.objects.get(name=each['year'])
            credit_a_value = each['a']
            credit_b_value = each['b']
            reduction_value = each.get('reduction_value')
            compliance_obj = ModelYearReportComplianceObligation.objects.create(
                model_year_report_id=id,
                model_year=model_year,
                category=category,
                credit_a_value=credit_a_value,
                credit_b_value=credit_b_value,
                reduction_value=reduction_value,
                from_gov=True
            )
            compliance_obj.save()

        return HttpResponse(
            status=201, content="Record Updated"
        )

    @action(detail=True, methods=['get'])
    @method_decorator(permission_required('VIEW_SALES'))
    def details(self, request, pk=None):

        most_recent_ldv_sales_param = request.GET.get("most_recent_ldv_sales", None)
        most_recent_ldv_sales = True if most_recent_ldv_sales_param == "true" else False

        organization = request.user.organization
        id = pk
        report = get_object_or_404(ModelYearReport, pk=id)

        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=report.id,
            signing_authority_assertion__module="compliance_obligation"
        ).first()
        snapshot = ModelYearReportComplianceObligation.objects.filter(
            from_gov=False,
            model_year_report_id=report.id,
        ).order_by('-update_timestamp')
        offset_snapshot = ModelYearReportCreditOffset.objects.filter(
            model_year_report_id=report.id,
        ).order_by('-update_timestamp')
        compliance_offset = None
        if offset_snapshot:
            offset_serializer = ModelYearReportComplianceObligationOffsetSerializer(
                offset_snapshot,
                context={'request': request},
                many=True
            )
            compliance_offset = offset_serializer.data

        is_assessment = request.GET.get('assessment') == 'True' and (
            (request.user.organization_id == report.organization_id and
             report.validation_status == ModelYearReportStatuses.ASSESSED) or
            request.user.is_government
        )
        use_from_gov_snapshot = request.GET.get('use_from_gov_snapshot') == 'True'

        if is_assessment or use_from_gov_snapshot:
            organization = report.organization
            snapshot_from_gov = ModelYearReportComplianceObligation.objects.filter(
                from_gov=True,
                model_year_report_id=report.id,
            ).order_by('-update_timestamp')

            if snapshot_from_gov:
                snapshot = snapshot_from_gov

        if (request.user.is_government and request.GET.get('assessment') == 'True' and
                report.validation_status not in [
                    ModelYearReportStatuses.ASSESSED,
                    ModelYearReportStatuses.RECOMMENDED
                ]) or (
                    not request.user.is_government and not confirmation and
                    report.validation_status == ModelYearReportStatuses.DRAFT
        ):
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
                to_date = date(report_year + 1, 10, 1,)
            else:
                from_date = date(report_year, 10, 1,)
                to_date = date(report_year + 1, 10, 1,)

            content = []

            transfers_in = CreditTransaction.objects.filter(
                credit_to=organization,
                transaction_type__transaction_type='Credit Transfer',
                transaction_timestamp__lt=to_date,
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
                transaction_timestamp__lt=to_date,
                transaction_timestamp__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
                'credit_class_id', 'model_year_id'
            )

            initative_agreements = CreditTransaction.objects.filter(
                credit_to=organization,
                credit_agreement_credit_transaction__credit_agreement__transaction_type=CreditAgreementTransactionTypes.INITIATIVE_AGREEMENT,
                credit_agreement_credit_transaction__credit_agreement__effective_date__lt=to_date,
                credit_agreement_credit_transaction__credit_agreement__effective_date__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
               'credit_class_id', 'model_year_id'
            )
            purchase_agreements = CreditTransaction.objects.filter(
                credit_to=organization,
                credit_agreement_credit_transaction__credit_agreement__transaction_type=CreditAgreementTransactionTypes.PURCHASE_AGREEMENT,
                credit_agreement_credit_transaction__credit_agreement__effective_date__lt=to_date,
                credit_agreement_credit_transaction__credit_agreement__effective_date__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
               'credit_class_id', 'model_year_id'
            )
            administrative_credit_alloction = CreditTransaction.objects.filter(
                credit_to=organization,
                credit_agreement_credit_transaction__credit_agreement__transaction_type=CreditAgreementTransactionTypes.ADMINISTRATIVE_CREDIT_ALLOCATION,
                credit_agreement_credit_transaction__credit_agreement__effective_date__lt=to_date,
                credit_agreement_credit_transaction__credit_agreement__effective_date__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
               'credit_class_id', 'model_year_id'
            )
            administrative_credit_reduction = CreditTransaction.objects.filter(
                debit_from=organization,
                credit_agreement_credit_transaction__credit_agreement__transaction_type=CreditAgreementTransactionTypes.ADMINISTRATIVE_CREDIT_REDUCTION,
                credit_agreement_credit_transaction__credit_agreement__effective_date__lt=to_date,
                credit_agreement_credit_transaction__credit_agreement__effective_date__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
               'credit_class_id', 'model_year_id'
            )
            automatic_administrative_penalty = CreditTransaction.objects.filter(
                credit_to=organization,
                credit_agreement_credit_transaction__credit_agreement__transaction_type=CreditAgreementTransactionTypes.AUTOMATIC_ADMINISTRATIVE_PENALTY,
                credit_agreement_credit_transaction__credit_agreement__effective_date__lt=to_date,
                credit_agreement_credit_transaction__credit_agreement__effective_date__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
               'credit_class_id', 'model_year_id'
            )
            credits_issued_sales = CreditTransaction.objects.filter(
                credit_to=organization,
                transaction_type__transaction_type='Validation',
                transaction_timestamp__lt=to_date,
                transaction_timestamp__gte=from_date,
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
                'credit_class_id', 'model_year_id'
            )
            purchase_agreements_serializer = CreditTransactionObligationActivitySerializer(purchase_agreements, read_only=True, many=True)
            initiative_agreements_serializer = CreditTransactionObligationActivitySerializer(initative_agreements, read_only=True, many=True)
            adminitrative_alloction_serializer = CreditTransactionObligationActivitySerializer(administrative_credit_alloction, read_only=True, many=True)
            administrative_reduction_serializer = CreditTransactionObligationActivitySerializer(administrative_credit_reduction, read_only=True, many=True)
            automatic_penalty_serializer = CreditTransactionObligationActivitySerializer(automatic_administrative_penalty, read_only=True, many=True)

            transfers_in_serializer = CreditTransactionObligationActivitySerializer(transfers_in, read_only=True, many=True)
            transfers_out_serializer = CreditTransactionObligationActivitySerializer(transfers_out, read_only=True, many=True)
            credit_sales_serializer = CreditTransactionObligationActivitySerializer(credits_issued_sales, read_only=True, many=True)

            for purchase_agreement in purchase_agreements_serializer.data:
                parse_summary_serializer(content, purchase_agreement, 'purchaseAgreement')

            for initative_agreement in initiative_agreements_serializer.data:
                parse_summary_serializer(content, initative_agreement, 'initiativeAgreement')

            for adminitrative_alloction in adminitrative_alloction_serializer.data:
                parse_summary_serializer(content, adminitrative_alloction, 'administrativeAllocation')

            for administrative_reduction in administrative_reduction_serializer.data:
                parse_summary_serializer(content, administrative_reduction, 'administrativeReduction')

            for automatic_penalty in automatic_penalty_serializer.data:
                parse_summary_serializer(content, automatic_penalty, 'automaticAdministrativePenalty')

            for transfer_in in transfers_in_serializer.data:
                parse_summary_serializer(content, transfer_in, 'transfersIn')

            for transfer_out in transfers_out_serializer.data:
                parse_summary_serializer(content, transfer_out, 'transfersOut')

            for credits_sale in credit_sales_serializer.data:
                parse_summary_serializer(content, credits_sale, 'creditsIssuedSales')

            pending_sales_submissions = SalesSubmission.objects.filter(
                organization=organization,
                validation_status__in=['SUBMITTED', 'RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'CHECKED']
            )

            totals = {}
            for obj in pending_sales_submissions:
                for record in obj.get_content_totals_by_vehicles():
                    try:
                        model_year = float(record['xls_model_year'])
                    except ValueError:
                        continue

                    if int(model_year) != int(report_year):
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



            current_supplemental = report.get_latest_supplemental(request)
            previous_report = report.get_previous_model_report()
            previous_report_latest_supplemental = None
            previous_report_latest_assesed_supplemental = None
            if(previous_report):
                previous_report_latest_supplemental = previous_report.get_latest_supplemental(request)
                previous_report_latest_assesed_supplemental = get_latest_assessed_supplemental(previous_report)

            prior_year_balance_a = 0
            prior_year_balance_b = 0
            prior_year = report_year - 1
            starting_balances = []

            if previous_report_latest_supplemental and report.validation_status == ModelYearReportStatuses.DRAFT and current_supplemental is None:
                # Check to see if there is a supplemental report from the previous year and none for the current year.
                starting_balances = SupplementalReportCreditActivity.objects.filter(
                    supplemental_report=previous_report_latest_supplemental.id,
                    category='ProvisionalBalanceAfterCreditReduction'
                ).order_by(
                    'model_year__name'
                )

            elif report.validation_status == ModelYearReportStatuses.DRAFT and current_supplemental:
                # This does not set the ldv sales because the current year's supplemental ldv sales will be used.
                starting_balances = SupplementalReportCreditActivity.objects.filter(
                    supplemental_report=current_supplemental.id,
                    category='ProvisionalBalanceAfterCreditReduction'
                ).order_by(
                    'model_year__name'
                )
                if current_supplemental.ldv_sales:
                    # If there is a supplemental report that exists from the previous with year containing ldvSales the new report should use that value.
                    report.ldv_sales = current_supplemental.ldv_sales

            elif previous_report:
                if previous_report_latest_assesed_supplemental:
                    starting_balances = SupplementalReportCreditActivity.objects.filter(
                        supplemental_report=previous_report_latest_assesed_supplemental.id,
                        category='ProvisionalBalanceAfterCreditReduction'
                    ).order_by(
                        'model_year__name'
                    )
                else:
                    starting_balances = ModelYearReportComplianceObligation.objects.filter(
                        model_year_report_id=previous_report.id,
                        category='ProvisionalBalanceAfterCreditReduction',
                        from_gov=True
                    ).order_by(
                        'model_year__name'
                    )

            # Track whether we're using an ending balance from a previous report as our starting point.
            # When we use ending balances from previous reports (assessed or supplemental), those balances
            # already account for any deficits that existed - they're "baked in" to the balance values.
            # So we should NOT also load deficits separately from the organization_deficits table,
            # or we'll double-count them.
            has_starting_balance_from_previous_report = False

            if starting_balances:
                for balance in starting_balances:
                    if balance and (
                            balance.credit_a_value > 0 or
                            balance.credit_b_value > 0
                    ):
                        content.append({
                            'credit_a_value': balance.credit_a_value,
                            'credit_b_value': balance.credit_b_value,
                            'category': 'creditBalanceStart',
                            'model_year': {
                                'name': balance.model_year.name
                            }
                        })

                # If we loaded starting_balances from ANY of the three scenarios above
                # it means we're using a previous report's ending balance as our starting point.
                # Mark this so we don't double-count deficits.
                has_starting_balance_from_previous_report = True

            # Only load deficits from organization_deficits table if we don't have a starting balance
            # from a previous report. If we do have a previous balance, deficits are already reflected in it.
            if not has_starting_balance_from_previous_report:
                deficits = OrganizationDeficits.objects.filter(
                    organization_id=organization.id
                ).order_by('model_year__name')

                for deficit in deficits:
                    index = 0
                    found = False

                    for each in content:
                        if each.get('category') == 'deficit' and \
                                each.get('model_year').get('name') == deficit.model_year.name:
                            found = True
                            break
                        index += 1

                    if found:
                        if deficit.credit_class.credit_class == 'A':
                            content[index]['credit_a_value'] += deficit.credit_value
                        else:
                            content[index]['credit_b_value'] += deficit.credit_value
                    else:
                        content.append({
                            'credit_a_value': deficit.credit_value if deficit.credit_class.credit_class == 'A' else 0,
                            'credit_b_value': deficit.credit_value if deficit.credit_class.credit_class == 'B' else 0,
                            'category': 'deficit',
                            'model_year': {
                                'name': deficit.model_year.name
                            }
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
                report.get_credit_reductions(), context={
                    'request': request
                }, many=True
            )

            return Response({
                'compliance_obligation': content + serializer.data,
                'compliance_offset': compliance_offset,
                'ldv_sales': get_most_recent_ldv_sales(report) if most_recent_ldv_sales else report.ldv_sales
            })
        else:
            serializer = ModelYearReportComplianceObligationSnapshotSerializer(
                snapshot, context={'request': request}, many=True
            )
        return Response({
            'compliance_obligation': serializer.data,
            'compliance_offset': compliance_offset,
            'ldv_sales': get_most_recent_ldv_sales(report) if most_recent_ldv_sales else report.ldv_sales
        })

    # pk should be MYR id
    @action(detail=True, methods=['get'])
    def previous_reassessment_credit_activity(self, request, pk=None):
        credit_activity = get_previous_reassessment_credit_activity(pk, "ProvisionalBalanceAfterCreditReduction")
        serializer = ModelYearReportSupplementalCreditActivitySerializer(
            credit_activity, 
            many=True, 
            context={"category_transforms": {"ProvisionalBalanceAfterCreditReduction": "PreviousReassessmentEndingBalance"}}
        )
        return Response(serializer.data)
    
    # pk should be a supplemental id
    @action(detail=True, methods=['get'])
    def reassessment_credit_activity(self, request, pk=None):
        credit_activity = get_reassessment_credit_activity(pk, "PreviousReassessmentEndingBalance")
        serializer = ModelYearReportSupplementalCreditActivitySerializer(credit_activity, many=True)
        return Response(serializer.data)
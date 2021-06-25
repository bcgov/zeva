from django.db import transaction
from decimal import Decimal
from datetime import date
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report import ModelYearReport
from api.models.model_year import ModelYear
from api.models.model_year_report_ldv_sales import \
    ModelYearReportLDVSales
from api.models.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligation
from api.models.user_profile import UserProfile
from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.models.organization_ldv_sales import OrganizationLDVSales
from api.serializers.model_year_report_confirmation import \
    ModelYearReportConfirmationSerializer
from api.serializers.user import MemberSerializer
from api.models.credit_class import CreditClass
from api.models.credit_transaction import CreditTransaction
from api.models.credit_transaction_type import CreditTransactionType
from api.models.weight_class import WeightClass
from api.models.organization import Organization
from api.models.account_balance import AccountBalance
from api.models.model_year_report_credit_transaction import ModelYearReportCreditTransaction


def get_model_year_report_statuses(report):
    supplier_information_status = 'UNSAVED'
    consumer_sales_status = 'UNSAVED'
    compliance_obligation_status = 'UNSAVED'
    supplier_information_confirmed_by = None
    consumer_sales_confirmed_by = None
    compliance_obligation_confirmed_by = None
    summary_status = 'UNSAVED'
    summary_confirmed_by = None
    assessment_status = 'UNSAVED'
    assessment_confirmed_by = None

    confirmations = ModelYearReportConfirmation.objects.filter(
        model_year_report_id=report.id,
        signing_authority_assertion__module__in=[
            'supplier_information', 'consumer_sales',
            'compliance_obligation'
        ],
        has_accepted=True
    )

    if report.validation_status == ModelYearReportStatuses.DRAFT:
        # the main table contains the supplier information
        # so there shouldn't be a chance where we have a report
        # and supplier information is not saved
        supplier_information_status = 'SAVED'

        vehicles = ModelYearReportVehicle.objects.filter(
            model_year_report_id=report.id
        )

        if vehicles:
            consumer_sales_status = 'SAVED'

        obligation = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=report.id
        )

        if obligation:
            compliance_obligation_status = 'SAVED'

    for confirmation in confirmations:
        serializer = ModelYearReportConfirmationSerializer(
            confirmation
        )

        if confirmation.signing_authority_assertion.module == \
                'supplier_information':
            supplier_information_status = 'CONFIRMED'
            supplier_information_confirmed_by = serializer.data

        if confirmation.signing_authority_assertion.module == \
                'consumer_sales':
            consumer_sales_status = 'CONFIRMED'
            consumer_sales_confirmed_by = serializer.data

        if confirmation.signing_authority_assertion.module == \
                'compliance_obligation':
            compliance_obligation_status = 'CONFIRMED'
            compliance_obligation_confirmed_by = serializer.data

    if supplier_information_status == 'CONFIRMED' and \
            consumer_sales_status == 'CONFIRMED' and \
            compliance_obligation_status == 'CONFIRMED':
        summary_status = 'SAVED'

    if report.validation_status == ModelYearReportStatuses.SUBMITTED:
        supplier_information_status = 'SUBMITTED'
        consumer_sales_status = 'SUBMITTED'
        compliance_obligation_status = 'SUBMITTED'
        summary_status = 'SUBMITTED'

        user_profile = UserProfile.objects.filter(username=report.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)

            summary_confirmed_by = {
                'create_timestamp': report.update_timestamp,
                'create_user': serializer.data
            }

    if report.validation_status == ModelYearReportStatuses.RECOMMENDED:
        assessment_status = 'RECOMMENDED'
        user_profile = UserProfile.objects.filter(username=report.update_user)
        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)

            assessment_confirmed_by = {
                'create_timestamp': report.update_timestamp,
                'create_user': serializer.data
            }
            
    if report.validation_status == ModelYearReportStatuses.ASSESSED:
        supplier_information_status = 'ASSESSED'
        consumer_sales_status = 'ASSESSED'
        compliance_obligation_status = 'ASSESSED'
        summary_status = 'ASSESSED'
        assessment_status = 'ASSESSED'
        user_profile = UserProfile.objects.filter(username=report.update_user)
        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)

            assessment_confirmed_by = {
                'create_timestamp': report.update_timestamp,
                'create_user': serializer.data
            }

    return {
        'supplier_information': {
            'status': supplier_information_status,
            'confirmed_by': supplier_information_confirmed_by
        },
        'consumer_sales': {
            'status': consumer_sales_status,
            'confirmed_by': consumer_sales_confirmed_by
        },
        'compliance_obligation': {
            'status': compliance_obligation_status,
            'confirmed_by': compliance_obligation_confirmed_by
        },
        'report_summary': {
            'status': summary_status,
            'confirmed_by': summary_confirmed_by
        },
        'assessment': {
            'status': assessment_status,
            'confirmed_by': assessment_confirmed_by
        }
    }


def adjust_credits(id, request):
    model_year = request.data.get('model_year')
    class_a_current = 0
    class_b_current = 0
    class_a_last = 0
    class_b_last = 0
    credit_list = {}
    credit_class_a = CreditClass.objects.get(credit_class='A')
    credit_class_b = CreditClass.objects.get(credit_class='B')
    model_year_id = ModelYear.objects.values_list("id", flat=True).filter(
        name=str(model_year)).first()
    model_year_previous_id = ModelYear.objects.values_list(
        "id", flat=True).filter(
        name=str(model_year-1)).first()

    organization_id = ModelYearReport.objects.values_list(
        'organization_id', flat=True).filter(
            id=id).first()
    ldv_sales = ModelYearReportLDVSales.objects.values_list(
        'ldv_sales', flat=True).filter(
        model_year_id=model_year_id,
        model_year_report_id=id,
        from_gov=True).first()

    OrganizationLDVSales.objects.update_or_create(
        organization_id=organization_id,
        ldv_sales=ldv_sales,
        model_year_id=model_year_id,
        defaults={
                'update_user': request.user.username
            }
    )
    obligation_current_year = ModelYearReportComplianceObligation.objects.filter(
        model_year_report_id=id,
        category__in=['ClassAReduction', 'UnspecifiedClassCreditReduction'],
        model_year_id=model_year_id
    )
    obligation_last_year = ModelYearReportComplianceObligation.objects.filter(
        model_year_report_id=id,
        category__in=['ClassAReduction', 'UnspecifiedClassCreditReduction'],
        model_year_id=model_year_previous_id
    )
    for i in obligation_current_year:
        class_a_current += int(i.credit_a_value)
        class_b_current += int(i.credit_b_value)
    credit_list[model_year_id] = {credit_class_a: class_a_current,
                                  credit_class_b: class_b_current}
    for i in obligation_last_year:
        class_a_last += int(i.credit_a_value)
        class_b_last += int(i.credit_b_value)
    credit_list[model_year_previous_id] = {credit_class_a: class_a_last,
                                           credit_class_b: class_b_last}

    for year, item in credit_list.items():
        for credit_class, credit_value in item.items():
            if credit_value > 0:
                total_value = 1 * credit_value
                added_transaction = CreditTransaction.objects.create(
                        create_user=request.user.username,
                        credit_class=credit_class,
                        debit_from=Organization.objects.get(
                            id=organization_id),
                        model_year_id=year,
                        number_of_credits=1,
                        credit_value=credit_value,
                        transaction_type=CreditTransactionType.objects.get(
                            transaction_type="Reduction"
                        ),
                        total_value=total_value,
                        update_user=request.user.username,
                        weight_class=WeightClass.objects.get(
                            weight_class_code='LDV')
                    )

                ModelYearReportCreditTransaction.objects.create(
                    model_year_report_id=id,
                    credit_transaction_id=added_transaction.id
                )

                current_balance = AccountBalance.objects.filter(
                    credit_class=credit_class,
                    organization_id=organization_id,
                    expiration_date=None
                ).order_by('-id').first()

                if current_balance:
                    new_balance = Decimal(current_balance.balance) -\
                        Decimal(total_value)
                    current_balance.expiration_date = date.today()
                    current_balance.save()
                else:
                    new_balance = 0 - total_value

                AccountBalance.objects.create(
                    balance=new_balance,
                    effective_date=date.today(),
                    credit_class=credit_class,
                    credit_transaction=added_transaction,
                    organization_id=organization_id
                )

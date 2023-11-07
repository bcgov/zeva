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
from api.models.organization_deficits import OrganizationDeficits
from api.models.organization_ldv_sales import OrganizationLDVSales
from api.serializers.model_year_report_confirmation import \
    ModelYearReportConfirmationSerializer
from api.serializers.user import MemberSerializer
from api.models.credit_class import CreditClass
from api.models.credit_transaction import CreditTransaction
from api.models.credit_transaction_type import CreditTransactionType
from api.models.weight_class import WeightClass
from api.models.organization import Organization
from api.models.model_year_report_credit_transaction import ModelYearReportCreditTransaction
from api.services.send_email import notifications_model_year_report
from api.models.supplemental_report import SupplementalReport
from api.models.supplemental_report_credit_activity import \
    SupplementalReportCreditActivity
from api.services.credit_transaction import update_credit_reductions, add_credit_reductions
from api.utilities.credit_transaction import (
    get_reduction_number_of_credits,
    get_reduction_timestamp,
    get_reduction_transaction_type,
    get_reduction_weight_class
)
from api.models.model_year_report_address import ModelYearReportAddress
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_assessment import ModelYearReportAssessment
from api.models.model_year_report_assessment_comment import ModelYearReportAssessmentComment

def get_model_year_report_statuses(report, request_user=None):
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

    if report.validation_status == ModelYearReportStatuses.SUBMITTED or \
            report.validation_status == report.validation_status.RETURNED:
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
        supplier_information_status = 'RECOMMENDED'
        consumer_sales_status = 'RECOMMENDED'
        compliance_obligation_status = 'RECOMMENDED'
        summary_status = 'RECOMMENDED'

        if not request_user.is_government:
            assessment_status = 'SUBMITTED'
            supplier_information_status = 'SUBMITTED'
            consumer_sales_status = 'SUBMITTED'
            compliance_obligation_status = 'SUBMITTED'
            summary_status = 'SUBMITTED'

        user_profile = UserProfile.objects.filter(username=report.update_user)
        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)

            assessment_confirmed_by = {
                'create_timestamp': report.update_timestamp,
                'create_user': serializer.data
            }

    if report.validation_status == ModelYearReportStatuses.RETURNED:
        assessment_status = 'RETURNED'
        supplier_information_status = 'RETURNED'
        consumer_sales_status = 'RETURNED'
        compliance_obligation_status = 'RETURNED'
        summary_status = 'RETURNED'
        if not request_user.is_government:
            assessment_status = 'SUBMITTED'
            supplier_information_status = 'SUBMITTED'
            consumer_sales_status = 'SUBMITTED'
            compliance_obligation_status = 'SUBMITTED'
            summary_status = 'SUBMITTED'

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

def adjust_credits_reassessment(id, request):
    ## this so far only updates LDV sales and reductions, we will need
    ## to add the logic for deficits later
    reassessment = SupplementalReport.objects.get(id=id)
    model_year_report_id = SupplementalReport.objects.values_list(
    'model_year_report_id', flat=True).filter(
        id=id).first()
    credit_class_a = CreditClass.objects.get(credit_class='A')
    credit_class_b = CreditClass.objects.get(credit_class='B')
    model_year_report = ModelYearReport.objects.get(id=model_year_report_id)
    model_year_id = model_year_report.model_year.id
    organization_id = model_year_report.organization.id
    ldv_sales = reassessment.ldv_sales
    if ldv_sales:
        OrganizationLDVSales.objects.update_or_create(
            organization_id=organization_id,
            model_year_id=model_year_id,
            defaults={
            'ldv_sales': ldv_sales,
            'update_user': request.user.username
            }
        )

    deficits = SupplementalReportCreditActivity.objects.filter(
        supplemental_report_id=reassessment.id,
        category='CreditDeficit'
    )
    
    for deficit in deficits:
        if deficit.credit_a_value > 0:
            OrganizationDeficits.objects.update_or_create(
                credit_class=credit_class_a,
                organization_id=organization_id,
                model_year_id=model_year_id,
                defaults={
                    'credit_value': deficit.credit_a_value,
                    'create_user': request.user.username,
                    'update_user': request.user.username
                }
            )
        else:
            OrganizationDeficits.objects.filter(
                credit_class=credit_class_a,
                organization_id=organization_id,
                model_year_id=model_year_id
            ).delete()

        if deficit.credit_b_value > 0:
            OrganizationDeficits.objects.update_or_create(
                credit_class=credit_class_b,
                organization_id=organization_id,
                model_year_id=model_year_id,
                defaults={
                    'credit_value': deficit.credit_b_value,
                    'create_user': request.user.username,
                    'update_user': request.user.username
                }
            )
        else:
            OrganizationDeficits.objects.filter(
                credit_class=credit_class_b,
                organization_id=organization_id,
                model_year_id=model_year_id
            ).delete()

    reassessment_reductions = request.data.get("reassessment_reductions")
    if reassessment_reductions is not None:
        reductions_to_update = reassessment_reductions.get("reductions_to_update")
        reductions_to_add = reassessment_reductions.get("reductions_to_add")
        if reductions_to_update is not None:
            update_credit_reductions(model_year_report, reductions_to_update)
        if reductions_to_add is not None:
            add_credit_reductions(model_year_report, request.user, reductions_to_add)


def adjust_credits(id, request):
    model_year = request.data.get('model_year')
    model_year_report_timestamp = get_reduction_timestamp(model_year)
    credit_class_a = CreditClass.objects.get(credit_class='A')
    credit_class_b = CreditClass.objects.get(credit_class='B')
    model_year_id = ModelYear.objects.values_list('id', flat=True).filter(
        name=str(model_year)).first()

    organization_id = ModelYearReport.objects.values_list(
        'organization_id', flat=True).filter(
            id=id).first()
    ldv_sales = ModelYearReportLDVSales.objects.values_list(
        'ldv_sales', flat=True
    ).filter(
        model_year_id=model_year_id,
        model_year_report_id=id
    ).order_by('-update_timestamp').first()

    OrganizationLDVSales.objects.update_or_create(
        organization_id=organization_id,
        model_year_id=model_year_id,
        defaults={
            'ldv_sales': ldv_sales,
            'update_user': request.user.username
        }
    )

    credit_reductions = {}

    from_gov = False

    # are there overrides?
    # if so, then we should only get the ones from 
    has_override = ModelYearReportComplianceObligation.objects.filter(
        model_year_report_id=id,
        from_gov=True
    ).first()

    if has_override:
        from_gov = True

    # order by timestamp is important as this is a way for us to check if there are
    # overrides
    reductions = ModelYearReportComplianceObligation.objects.filter(
        model_year_report_id=id,
        category__in=['ClassAReduction', 'UnspecifiedClassCreditReduction', 'ReductionsToOffsetDeficit'],
        from_gov=from_gov,
    ).order_by('model_year__name', 'update_timestamp')

    for reduction in reductions:
        category = reduction.category

        if reduction.model_year_id not in credit_reductions:
            credit_reductions[reduction.model_year_id] = {}

        if category not in credit_reductions[reduction.model_year_id]:
            credit_reductions[reduction.model_year_id][category] = {}
        
        credit_reductions[reduction.model_year_id][category]['A'] = \
            reduction.credit_a_value
        credit_reductions[reduction.model_year_id][category]['B'] = \
            reduction.credit_b_value

    total_a_value = 0
    total_b_value = 0

    for year, item in credit_reductions.items():
        for category, values in item.items():
            for credit_class_obj, credit_value in values.items():
                credit_class = credit_class_a if credit_class_obj == 'A' else credit_class_b

                if credit_value > 0:
                    added_transaction = CreditTransaction.objects.create(
                        create_user=request.user.username,
                        credit_class=credit_class,
                        debit_from=Organization.objects.get(
                            id=organization_id
                        ),
                        model_year_id=year,
                        number_of_credits=get_reduction_number_of_credits(),
                        credit_value=credit_value,
                        transaction_timestamp=model_year_report_timestamp,
                        transaction_type=get_reduction_transaction_type(),
                        total_value=credit_value,
                        update_user=request.user.username,
                        weight_class=get_reduction_weight_class()
                    )

                    if credit_class_obj == 'A':
                        total_a_value += credit_value
                    elif credit_class_obj == 'B':
                        total_b_value += credit_value
                    ModelYearReportCreditTransaction.objects.create(
                        model_year_report_id=id,
                        credit_transaction_id=added_transaction.id
                    )

    deficits = ModelYearReportComplianceObligation.objects.filter(
        model_year_report_id=id,
        category='CreditDeficit',
        from_gov=from_gov
    )

    for deficit in deficits:
        if deficit.credit_a_value > 0:
            OrganizationDeficits.objects.update_or_create(
                credit_class=credit_class_a,
                organization_id=organization_id,
                model_year_id=model_year_id,
                defaults={
                    'credit_value': deficit.credit_a_value,
                    'create_user': request.user.username,
                    'update_user': request.user.username
                }
            )
        else:
            OrganizationDeficits.objects.filter(
                credit_class=credit_class_a,
                organization_id=organization_id,
                model_year_id=model_year_id
            ).delete()

        if deficit.credit_b_value > 0:
            OrganizationDeficits.objects.update_or_create(
                credit_class=credit_class_b,
                organization_id=organization_id,
                model_year_id=model_year_id,
                defaults={
                    'credit_value': deficit.credit_b_value,
                    'create_user': request.user.username,
                    'update_user': request.user.username
                }
            )
        else:
            OrganizationDeficits.objects.filter(
                credit_class=credit_class_b,
                organization_id=organization_id,
                model_year_id=model_year_id
            ).delete()

def check_validation_status_change(old_status, updated_model_year_report):
        new_status = updated_model_year_report.validation_status
        if new_status != old_status:
            report_returned_to_supplier = False
            if old_status != ModelYearReportStatuses.DRAFT and new_status == ModelYearReportStatuses.DRAFT:
                report_returned_to_supplier = True
            notifications_model_year_report(updated_model_year_report, report_returned_to_supplier)

def get_model_year_report(model_year_report_id, *fields):
    return ModelYearReport.objects.filter(id=model_year_report_id).only(*fields).first()

def get_most_recent_myr_id(organization, *statuses):
    model_year_report = (
        ModelYearReport.objects.only("id")
        .filter(organization=organization)
        .filter(
            validation_status__in=statuses
        )
        .order_by("-model_year__effective_date")
        .first()
    )
    return model_year_report

def delete_model_year_report(model_year_report):
    ModelYearReportAddress.objects.filter(
        model_year_report=model_year_report
    ).delete()
    ModelYearReportHistory.objects.filter(
        model_year_report=model_year_report
    ).delete()
    ModelYearReportLDVSales.objects.filter(
        model_year_report=model_year_report
    ).delete()
    ModelYearReportMake.objects.filter(
        model_year_report=model_year_report
    ).delete()
    ModelYearReportComplianceObligation.objects.filter(
        model_year_report=model_year_report
    ).delete()
    ModelYearReportConfirmation.objects.filter(
        model_year_report=model_year_report
    ).delete()
    ModelYearReportVehicle.objects.filter(
        model_year_report=model_year_report
    ).delete()
    ModelYearReportAssessmentComment.objects.filter(
        model_year_report=model_year_report
    ).delete()
    ModelYearReportAssessment.objects.filter(
        model_year_report=model_year_report
    ).delete()
    model_year_report.delete()
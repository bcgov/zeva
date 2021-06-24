from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report_ldv_sales import \
    ModelYearReportLDVSales
from api.models.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligation
from api.models.user_profile import UserProfile
from api.models.model_year_report_vehicle import ModelYearReportVehicle

from api.serializers.model_year_report_confirmation import \
    ModelYearReportConfirmationSerializer
from api.serializers.user import MemberSerializer


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

from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report_previous_sales import \
    ModelYearReportPreviousSales
from api.models.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligation
from api.serializers.model_year_report_confirmation import \
    ModelYearReportConfirmationSerializer


def get_model_year_report_statuses(report):
    supplier_information_status = 'UNSAVED'
    consumer_sales_status = 'UNSAVED'
    compliance_obligation_status = 'UNSAVED'
    supplier_information_confirmed_by = None
    consumer_sales_confirmed_by = None
    compliance_obligation_confirmed_by = None

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
        previous_sales = ModelYearReportPreviousSales.objects.filter(
            model_year_report_id=report.id
        )

        if previous_sales:
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

    if report.validation_status == ModelYearReportStatuses.SUBMITTED:
        supplier_information_status = 'SUBMITTED'
        consumer_sales_status = 'SUBMITTED'
        compliance_obligation_status = 'SUBMITTED'

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
        }
    }

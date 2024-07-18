from api.models.organization import Organization
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.utilities.compliance_period import get_compliance_year
from django.utils import timezone
from django.db.models import Q


def get_organization(id):
    return Organization.objects.get(id=id)


def get_current_assessed_report(organization):
    if organization is None:
        return None
    current_year = get_compliance_year(timezone.now())
    return (
        ModelYearReport.objects.filter(organization=organization)
        .filter(
            Q(validation_status=ModelYearReportStatuses.ASSESSED)
            | Q(validation_status=ModelYearReportStatuses.REASSESSED)
        )
        .filter(model_year__name=current_year)
        .first()
    )

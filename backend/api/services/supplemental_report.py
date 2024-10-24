from api.models.supplemental_report import SupplementalReport
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report import ModelYearReport
from api.models.supplemental_report_credit_activity import (
    SupplementalReportCreditActivity,
)


def get_map_of_model_year_report_ids_to_latest_supplemental_ids(
    organization, *statuses
):
    result = {}
    reports = (
        SupplementalReport.objects.filter(model_year_report__organization=organization)
        .filter(status__in=statuses)
        .only("id", "model_year_report__id")
        .order_by("create_timestamp")
    )
    for report in reports:
        result[report.model_year_report.id] = report.id
    return result


# order is from oldest to newest according to how the reports are related to each other by their supplemental_id fields
# however, if there is more than one initial report, the order will be by creation timestamp
def get_ordered_list_of_supplemental_reports(model_year_report, *fields):
    reports = list(
        SupplementalReport.objects.filter(model_year_report=model_year_report)
        .exclude(status=ModelYearReportStatuses.DELETED)
        .only("id", "supplemental_id", *fields)
        .order_by("create_timestamp")
    )
    initial_reports = []
    for report in reports:
        if report.supplemental_id is None:
            initial_reports.append(report)
    if len(initial_reports) == 1:
        result = [initial_reports[0]]
        for _ in range(len(reports) - 1):
            current_report_id = result[-1].id
            for report in reports:
                if report.supplemental_id == current_report_id:
                    result.append(report)
                    break
        return result
    return reports


def get_latest_assessed_supplemental(model_year_report):
    result = None
    report_in_question = None
    reports = get_ordered_list_of_supplemental_reports(model_year_report, "status")
    for report in reports:
        if report.status in [
            ModelYearReportStatuses.ASSESSED,
            ModelYearReportStatuses.REASSESSED,
        ]:
            report_in_question = report
    if report_in_question is not None:
        result = SupplementalReport.objects.get(id=report_in_question.id)
    return result


def get_previous_reassessment_credit_activity(model_year_report_id, category):
    result = []
    report = (
        ModelYearReport.objects.filter(id=model_year_report_id)
        .select_related("organization", "model_year")
        .first()
    )
    if report is not None:
        previous_model_year = int(report.model_year.name) - 1
        previous_report = (
            ModelYearReport.objects.filter(organization=report.organization)
            .filter(model_year__name=previous_model_year)
            .filter(
                validation_status__in=[
                    ModelYearReportStatuses.ASSESSED,
                    ModelYearReportStatuses.REASSESSED,
                ]
            )
            .first()
        )
        if previous_report is not None:
            supplemental_report = (
                SupplementalReport.objects.filter(model_year_report=previous_report)
                .filter(
                    status__in=[
                        ModelYearReportStatuses.ASSESSED,
                        ModelYearReportStatuses.REASSESSED,
                    ]
                )
                .order_by("-create_timestamp")
                .first()
            )
            if supplemental_report is not None:
                result = list(
                    SupplementalReportCreditActivity.objects.filter(
                        supplemental_report=supplemental_report
                    )
                    .filter(category=category)
                    .select_related("model_year")
                )
    return result


def get_reassessment_credit_activity(supplemental_id, category):
    return list(
        SupplementalReportCreditActivity.objects.filter(
            supplemental_report=supplemental_id
        )
        .filter(category=category)
        .select_related("model_year")
    )

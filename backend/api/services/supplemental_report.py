from api.models.supplemental_report import SupplementalReport


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

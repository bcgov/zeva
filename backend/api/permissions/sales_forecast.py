from rest_framework import permissions
from api.services.model_year_report import get_model_year_report
from api.models.model_year_report_statuses import ModelYearReportStatuses


class SalesForecastPermissions(permissions.BasePermission):

    def has_permission(self, request, view):
        model_year_report_id = view.kwargs.get("pk")
        model_year_report = None
        user = request.user
        is_government = user.is_government
        organization_matches = False
        if model_year_report_id is not None:
            model_year_report = get_model_year_report(model_year_report_id)
            if (
                model_year_report is not None
                and model_year_report.organization == user.organization
            ):
                organization_matches = True

        if view.action == "save" and not is_government and organization_matches:
            return True
        elif view.action == "records" or view.action == "totals":
            if model_year_report is not None:
                if is_government and model_year_report.validation_status not in [
                    ModelYearReportStatuses.DRAFT,
                    ModelYearReportStatuses.DELETED,
                ]:
                    return True
                elif not is_government and organization_matches is True:
                    return True
        elif view.action == "template_url":
            return True

        return False

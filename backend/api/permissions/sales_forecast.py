from rest_framework import permissions
from api.services.model_year_report import get_model_year_report
from api.models.model_year_report_statuses import ModelYearReportStatuses


class SalesForecastPermissions(permissions.BasePermission):

    def has_permission(self, request, view):
        user_is_government = request.user.is_government

        if view.action == "save" and not user_is_government:
            return True
        elif view.action == "records" or view.action == "totals":
            if not user_is_government:
                return True
            model_year_report_id = view.kwargs.get("pk")
            model_year_report = get_model_year_report(model_year_report_id)
            if model_year_report.validation_status not in [
                ModelYearReportStatuses.DRAFT,
                ModelYearReportStatuses.DELETED,
            ]:
                return True
        elif view.action == "template_url":
            return True

        return False

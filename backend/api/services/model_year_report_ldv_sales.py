from api.models.model_year_report_ldv_sales import ModelYearReportLDVSales


def get_most_recent_ldv_sales(model_year_report):
    ldv_sales_obj = (
        ModelYearReportLDVSales.objects.filter(
            model_year=model_year_report.model_year, model_year_report=model_year_report
        )
        .order_by("-update_timestamp")
        .only("ldv_sales")
        .first()
    )
    if ldv_sales_obj:
        return ldv_sales_obj.ldv_sales
    return None

from zeva.settings import MINIO
from api.models.sales_forecast import SalesForecast
from api.models.sales_forecast_record import SalesForecastRecord
from api.services.minio import minio_get_object
from api.constants.zev_type import ZEV_TYPE


def update_or_create(model_year_report_id, user, totals):
    user_info = {"create_user": user.id, "update_user": user.id}
    defaults = user_info | totals
    forecast, created = SalesForecast.objects.update_or_create(
        model_year_report_id=model_year_report_id, defaults=defaults
    )
    return forecast


def delete_records(sales_forecast):
    SalesForecastRecord.objects.filter(sales_forecast=sales_forecast).delete()


def create_records(sales_forecast, records, user):
    to_create = []
    if records:
        for record in records:
            zev_type = ZEV_TYPE[record.pop("type")]
            record_to_create = SalesForecastRecord(
                sales_forecast=sales_forecast,
                type=zev_type,
                create_user=user.id,
                update_user=user.id,
                **record
            )
            to_create.append(record_to_create)
    SalesForecastRecord.objects.bulk_create(to_create)


def get_forecast_records_qs(model_year_report_id):
    qs = SalesForecastRecord.objects.filter(
        sales_forecast__model_year_report_id=model_year_report_id
    ).order_by("pk")
    return qs


def get_forecast(model_year_report_id):
    try:
        forecast = SalesForecast.objects.get(model_year_report_id=model_year_report_id)
        return forecast
    except SalesForecast.DoesNotExist:
        return None


def get_minio_template_url():
    template_name = MINIO["SALES_FORECAST_TEMPLATE"]
    response_headers = {
        "response-content-disposition": "attachment; filename=sales_forecast_template.xlsx"
    }
    return minio_get_object(template_name, response_headers)

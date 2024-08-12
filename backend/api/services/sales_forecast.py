from django.db import transaction
from zeva.settings import MINIO
from api.models.sales_forecast import SalesForecast
from api.models.sales_forecast_record import SalesForecastRecord
from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass
from api.services.generic import get_model_instances_map
from api.services.minio import minio_get_object
from api.constants.zev_type import ZEV_TYPE


def deactivate(model_year_report_id, user):
    try:
        forecast = SalesForecast.objects.get(
            active=True, model_year_report_id=model_year_report_id
        )
        forecast.active = False
        forecast.update_user = user.id
        forecast.save()
    except SalesForecast.DoesNotExist:
        pass


@transaction.atomic
def create(model_year_report_id, forecast_records, user, **totals):
    forecast = SalesForecast(
        model_year_report_id=model_year_report_id,
        create_user=user.id,
        update_user=user.id,
        **totals
    )
    forecast.save()
    create_records(forecast, forecast_records, user)


def create_records(sales_forecast, records, user):
    to_create = []
    model_years = set()
    zev_classes = set()
    if records:
        for record in records:
            model_years.add(record["model_year"])
            zev_classes.add(record["zev_class"])
        model_years_qs = ModelYear.objects.filter(name__in=model_years)
        zev_classes_qs = CreditClass.objects.filter(credit_class__in=zev_classes)
        model_years_map = get_model_instances_map(model_years_qs, "name")
        zev_classes_map = get_model_instances_map(zev_classes_qs, "credit_class")
        for record in records:
            zev_type = ZEV_TYPE[record.pop("type")]
            record_to_create = SalesForecastRecord(
                sales_forecast=sales_forecast,
                model_year=model_years_map.get(record.pop("model_year")),
                type=zev_type,
                zev_class=zev_classes_map.get(record.pop("zev_class")),
                create_user=user.id,
                update_user=user.id,
                **record
            )
            to_create.append(record_to_create)
    SalesForecastRecord.objects.bulk_create(to_create)


def get_forecast_records_qs(model_year_report_id):
    qs = (
        SalesForecastRecord.objects.filter(
            sales_forecast__model_year_report_id=model_year_report_id,
            sales_forecast__active=True,
        )
        .select_related("model_year", "zev_class")
        .order_by("pk")
    )
    return qs


def get_forecast(model_year_report_id):
    try:
        forecast = SalesForecast.objects.get(
            active=True, model_year_report_id=model_year_report_id
        )
        return forecast
    except SalesForecast.DoesNotExist:
        return None


def get_minio_template_url():
    template_name = MINIO["SALES_FORECAST_TEMPLATE"]
    response_headers = {
        "response-content-disposition": "attachment; filename=sales_forecast_template.xlsx"
    }
    return minio_get_object(template_name, response_headers)

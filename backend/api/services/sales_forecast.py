from django.db import transaction
import urllib.request
import pandas as pd
from zeva.settings import MINIO
from api.models.sales_forecast import SalesForecast
from api.models.sales_forecast_record import SalesForecastRecord
from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass
from api.services.generic import get_model_instances_map
from api.services.minio import minio_get_object
from api.constants.zev_type import ZEV_TYPE
import xlrd
from api.services.minio import minio_get_object

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

    url = minio_get_object(forecast_records)
    urllib.request.urlretrieve(url, forecast_records)
    # forecast = SalesForecast(
    #     model_year_report_id=model_year_report_id,
    #     create_user=user.id,
    #     update_user=user.id,
    #     **totals
    # )
    # forecast.save()
    create_records(forecast_records, user)

def create_records(records, user):

    df = pd.read_excel(records, 'Sales Forecast', header=0)
    to_create = []

    model_years = df['model_year'].unique().tolist()
    zev_classes = df["zev_class"].unique().tolist()
    
    model_years_qs = ModelYear.objects.filter(name__in=model_years)
    zev_classes_qs = CreditClass.objects.filter(credit_class__in=zev_classes)
    
    get_or_create_model_year = get_model_instances_map(model_years_qs, ModelYear, "name")
    get_or_create_zev_class = get_model_instances_map(zev_classes_qs, CreditClass, "credit_class")

    for index, row in df.iterrows():
        try:
            model_year_instance = get_or_create_model_year(row['model_year'])
            zev_class_instance = get_or_create_zev_class(row['zev_class'])

            zev_type = ZEV_TYPE[row['type']]
            
            record_to_create = SalesForecastRecord(
                sales_forecast_id=4,
                model_year=model_year_instance,
                type=zev_type,
                zev_class=zev_class_instance,
                create_user=user.id,
                update_user=user.id,
                range=row['range'],
                total_sales=row['total_sales'],
                interior_volume=row['interior_volume']
            )
            to_create.append(record_to_create)
        except KeyError as e:
            print(f"Key error: {e} in row {index}")
        except Exception as e:
            print(f"Unexpected error: {e} in row {index}")

    created_records = SalesForecastRecord.objects.bulk_create(to_create)
    return created_records

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

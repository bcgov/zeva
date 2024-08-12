import os
from datetime import timedelta


def config():
    return {
        "ENDPOINT": os.getenv("MINIO_ENDPOINT", None),
        "USE_SSL": bool(os.getenv("MINIO_USE_SSL", "False").lower() in ["true", 1]),
        "ACCESS_KEY": os.getenv("MINIO_ACCESS_KEY", None),
        "SECRET_KEY": os.getenv("MINIO_SECRET_KEY", None),
        "BUCKET_NAME": os.getenv("MINIO_BUCKET_NAME", "zeva"),
        "EXPIRY": os.getenv("MINIO_EXPIRY", timedelta(days=1)),
        "PREFIX": os.getenv("MINIO_PREFIX", None),
        "SALES_FORECAST_TEMPLATE": os.getenv(
            "MINIO_SALES_FORECAST_TEMPLATE", "templates/sales_forecast_template.xlsx"
        ),
    }

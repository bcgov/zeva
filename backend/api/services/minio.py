from datetime import timedelta
from minio import Minio

from zeva.settings import MINIO

minio = Minio(
    MINIO['ENDPOINT'],
    access_key=MINIO['ACCESS_KEY'],
    secret_key=MINIO['SECRET_KEY'],
    secure=MINIO['USE_SSL']
)
try:
    minio.make_bucket("zeva")
except:
    pass

def minio_get_object(object_name):
    return minio.presigned_get_object(
        bucket_name=MINIO['BUCKET_NAME'],
        object_name=object_name,
        expires=timedelta(seconds=3600)
    )


def minio_put_object(object_name):
    return minio.presigned_put_object(
        bucket_name=MINIO['BUCKET_NAME'],
        object_name=object_name,
        expires=MINIO['EXPIRY']
    )


def minio_remove_objects(objects_iter):
    return minio.remove_objects(
        bucket_name=MINIO['BUCKET_NAME'],
        objects_iter=objects_iter
    )


def minio_remove_object(object_name):
    return minio.remove_object(
        bucket_name=MINIO['BUCKET_NAME'],
        object_name=object_name
    )

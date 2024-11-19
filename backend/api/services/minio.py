from datetime import timedelta
from minio import Minio
from zeva.settings import MINIO


def get_minio_client():
    return Minio(
        MINIO['ENDPOINT'],
        access_key=MINIO['ACCESS_KEY'],
        secret_key=MINIO['SECRET_KEY'],
        secure=MINIO['USE_SSL']
    )


def get_refined_object_name(object_name):
    prefix = MINIO['PREFIX']
    if prefix:
        return prefix + '/' + object_name
    return object_name


def minio_get_object(object_name, response_headers=None):
    client = get_minio_client()
    return client.presigned_get_object(
        bucket_name=MINIO['BUCKET_NAME'],
        object_name=get_refined_object_name(object_name),
        expires=timedelta(seconds=3600),
        response_headers=response_headers
    )


def get_minio_object(object_name):
    client = get_minio_client()
    refined_object_name = get_refined_object_name(object_name)
    return client.get_object(MINIO['BUCKET_NAME'], refined_object_name)


def minio_put_object(object_name):
    client = get_minio_client()
    return client.presigned_put_object(
        bucket_name=MINIO['BUCKET_NAME'],
        object_name=get_refined_object_name(object_name),
        expires=MINIO['EXPIRY']
    )


def minio_remove_objects(objects_iter):
    client = get_minio_client()
    return client.remove_objects(
        bucket_name=MINIO['BUCKET_NAME'],
        objects_iter=objects_iter
    )


def minio_remove_object(object_name):
    client = get_minio_client()
    return client.remove_object(
        bucket_name=MINIO['BUCKET_NAME'],
        object_name=get_refined_object_name(object_name)
    )

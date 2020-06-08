import re
from datetime import timedelta
from minio import Minio
from django.core.exceptions import ImproperlyConfigured
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.vehicle_attachment import VehicleAttachment

from zeva.settings import MINIO


class VehicleAttachmentSerializer(ModelSerializer):
    """
    Readonly Serializer for attachments
    """
    url = SerializerMethodField()

    def get_url(self, obj):
        try:
            minio = Minio(
                MINIO['ENDPOINT'],
                access_key=MINIO['ACCESS_KEY'],
                secret_key=MINIO['SECRET_KEY'],
                secure=MINIO['USE_SSL']
            )

            object_name = obj.minio_object_name

            url = minio.presigned_get_object(
                bucket_name=MINIO['BUCKET_NAME'],
                object_name=object_name,
                expires=timedelta(seconds=3600)
            )

            return url

        except TypeError:
            raise ImproperlyConfigured(
                "Minio is not properly configured for this server."
            )

    class Meta:
        model = VehicleAttachment
        fields = (
            'id', 'mime_type', 'size', 'filename', 'minio_object_name',
            'is_removed', 'url',
        )
        read_only_fields = (
            'id', 'is_removed', 'url',
        )

from django.core.exceptions import ImproperlyConfigured
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.credit_agreement_attachment import CreditAgreementAttachment

from api.services.minio import minio_get_object


class CreditAgreementAttachmentSerializer(ModelSerializer):
    """
    Readonly Serializer for attachments
    """
    url = SerializerMethodField()

    def get_url(self, obj):
        try:
            object_name = obj.minio_object_name

            url = minio_get_object(object_name)

            return url

        except TypeError:
            raise ImproperlyConfigured(
                "Minio is not properly configured for this server."
            )

    class Meta:
        model = CreditAgreementAttachment
        fields = (
            'id', 'mime_type', 'size', 'filename', 'minio_object_name',
            'is_removed', 'url',
        )
        read_only_fields = (
            'id', 'is_removed', 'url',
        )

import uuid

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from api.permissions.upload import UploadPermissions
from api.services.minio import minio_put_object


class UploadViewSet(ViewSet):
    permission_classes = [UploadPermissions]
    http_method_names = ['get']

    @action(detail=False, methods=['get'])
    def minio_url(self, request):
        object_name = uuid.uuid4().hex
        url = minio_put_object(object_name)

        return Response({
            'url': url,
            'minio_object_name': object_name
        })

import uuid

from django.utils.decorators import method_decorator

from rest_framework import mixins, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models.credit_agreement import CreditAgreement
from api.serializers.credit_agreement import CreditAgreementSerializer, \
    CreditAgreementListSerializer, CreditAgreementSaveSerializer
from api.services.minio import minio_put_object
from auditable.views import AuditableMixin


class CreditAgreementViewSet(
    AuditableMixin, viewsets.GenericViewSet, mixins.CreateModelMixin,
    mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin
):
    permission_classes = (permissions.AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = CreditAgreement.objects.all()
    serializer_classes = {
        'default': CreditAgreementListSerializer,
        'create': CreditAgreementSaveSerializer,

    }

    def get_serializer_class(self):
        print("action: ", self.action)
        if self.action in list(self.serializer_classes.keys()):
            print(self.serializer_classes[self.action])
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    @action(detail=True, methods=['get'])
    def minio_url(self, request, pk=None):
        object_name = uuid.uuid4().hex
        url = minio_put_object(object_name)

        return Response({
            'url': url,
            'minio_object_name': object_name
        })

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import F, Q

from api.models.credit_transfer import CreditTransfer
from api.serializers.credit_transfer import CreditTransferSerializer,\
    CreditTransferMultiSaveSerializer, CreditTransferSaveSerializer
from auditable.views import AuditableMixin


class CreditTransferViewset(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.CreateModelMixin, mixins.ListModelMixin,
        mixins.UpdateModelMixin, mixins.RetrieveModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'default': CreditTransferSerializer,
        'create': CreditTransferMultiSaveSerializer,
        'partial_update': CreditTransferSaveSerializer,
        'update': CreditTransferSaveSerializer,
    }

    def get_queryset(self):
        request = self.request

        if request.user.is_government:
            queryset = CreditTransfer.objects.all()
        else:
            queryset = CreditTransfer.objects.filter(
                Q(to_supplier_id=request.user.organization.id) |
                Q(from_supplier_id=request.user.organization.id)
            )

        return queryset

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']


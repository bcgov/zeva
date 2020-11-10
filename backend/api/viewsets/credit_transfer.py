from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.serializers.credit_transaction import CreditTransactionSaveSerializer
from api.serializers.credit_transfer import CreditTransferSerializer, \
    CreditTransferSaveSerializer
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
        'create': CreditTransactionSaveSerializer,
        'partial_update': CreditTransferSaveSerializer,
        'update': CreditTransferSaveSerializer,
    }

    def get_queryset(self):
        request = self.request

        if request.user.is_government:
            queryset = CreditTransfer.objects.exclude(status__in=(
                CreditTransferStatuses.DRAFT,
                CreditTransferStatuses.SUBMITTED,
                CreditTransferStatuses.DELETED,
            ))
        else:
            queryset = CreditTransfer.objects.filter(
                Q(credit_to_id=request.user.organization.id) |
                Q(debit_from_id=request.user.organization.id),
                ).exclude(status__in=(
                    CreditTransferStatuses.RECOMMEND_APPROVAL,
                    CreditTransferStatuses.RECOMMEND_REJECTION,
                    ))
        return queryset

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']
    
    # def perform_update(self, serializer):
    #     submission = serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = CreditTransferSaveSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        credit_transfer = serializer.save()

        response = credit_transfer
        headers = self.get_success_headers(response)

        return Response(
            response, status=status.HTTP_201_CREATED, headers=headers
        )

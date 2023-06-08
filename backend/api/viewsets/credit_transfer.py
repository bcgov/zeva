import logging
from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from django.db.models import Q

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.permissions.credit_transfer import CreditTransferPermissions
from api.serializers.credit_transfer import CreditTransferSerializer, \
    CreditTransferSaveSerializer, CreditTransferListSerializer
from auditable.views import AuditableMixin
from api.services.send_email import notifications_credit_transfers
from api.services.credit_transaction import validate_transfer

LOGGER = logging.getLogger(__name__)


class CreditTransferViewset(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.CreateModelMixin, mixins.ListModelMixin,
        mixins.UpdateModelMixin, mixins.RetrieveModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = (CreditTransferPermissions,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'default': CreditTransferSerializer,
        'create': CreditTransferSaveSerializer,
        'partial_update': CreditTransferSaveSerializer,
        'update': CreditTransferSaveSerializer,
        'list': CreditTransferListSerializer,
    }

    def get_queryset(self):
        request = self.request

        if request.user.is_government:
            queryset = CreditTransfer.objects.exclude(status__in=[
                CreditTransferStatuses.DRAFT,
                CreditTransferStatuses.SUBMITTED,
                CreditTransferStatuses.DELETED,
                CreditTransferStatuses.RESCIND_PRE_APPROVAL,
                CreditTransferStatuses.DISAPPROVED,
            ])
        else:
            queryset = CreditTransfer.objects.filter(
                (Q(credit_to_id=request.user.organization.id) &
                    Q(status__in=[
                        CreditTransferStatuses.SUBMITTED,
                        CreditTransferStatuses.APPROVED,
                        CreditTransferStatuses.DISAPPROVED,
                        CreditTransferStatuses.RESCINDED,
                        CreditTransferStatuses.RESCIND_PRE_APPROVAL,
                        CreditTransferStatuses.RECOMMEND_APPROVAL,
                        CreditTransferStatuses.RECOMMEND_REJECTION,
                        CreditTransferStatuses.REJECTED,
                        CreditTransferStatuses.VALIDATED
                        ])) |
                Q(debit_from_id=request.user.organization.id)
                ).exclude(status__in=[CreditTransferStatuses.DELETED])
        return queryset

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

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

    def perform_update(self, serializer, *args, **kwargs):
        transfer = serializer.save()
        if transfer.status == CreditTransferStatuses.VALIDATED:
            validate_transfer(transfer)

        transfer_sent_back_to_analyst = False
        old_transfer_status = transfer.old_status
        new_transfer_status = transfer.status
        if (old_transfer_status == CreditTransferStatuses.RECOMMEND_APPROVAL or old_transfer_status == CreditTransferStatuses.RECOMMEND_REJECTION) and new_transfer_status == CreditTransferStatuses.APPROVED:
            transfer_sent_back_to_analyst = True
        notifications_credit_transfers(transfer, transfer_sent_back_to_analyst)

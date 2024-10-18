import logging
from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.settings import api_settings
from django.db.models import Q

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.permissions.credit_transfer import CreditTransferPermissions
from api.serializers.credit_transfer import CreditTransferSerializer, \
    CreditTransferSaveSerializer, CreditTransferListSerializer, CreditTransferOrganizationBalancesSerializer
from api.serializers.credit_transfer_comment import CreditTransferCommentSerializer
from auditable.views import AuditableUpdateMixin
from api.services.send_email import notifications_credit_transfers
from api.services.credit_transaction import validate_transfer
from api.services.credit_transfer_comment import get_comment, delete_comment
from api.utilities.comment import update_comment_text

LOGGER = logging.getLogger(__name__)


class CreditTransferViewset(
        viewsets.GenericViewSet,
        AuditableUpdateMixin,
        mixins.ListModelMixin,
        mixins.RetrieveModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """
    permission_classes = [CreditTransferPermissions]
    http_method_names = ['get', 'post', 'patch']

    serializer_classes = {
        'default': CreditTransferSerializer,
        'create': CreditTransferSaveSerializer,
        'partial_update': CreditTransferSaveSerializer,
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
        headers = {}
        try:
            headers = {"Location": str(response[api_settings.URL_FIELD_NAME])}
        except (TypeError, KeyError):
            pass

        return Response(
            response, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_update(self, serializer, *args, **kwargs):
        transfer = serializer.save()
        if transfer.status == CreditTransferStatuses.VALIDATED:
            validate_transfer(transfer)

        transfer_sent_back_to_analyst = False
        transfer_saved_by_analyst = False
        old_transfer_status = transfer.old_status
        new_transfer_status = transfer.status
        if (old_transfer_status == CreditTransferStatuses.RECOMMEND_APPROVAL or old_transfer_status == CreditTransferStatuses.RECOMMEND_REJECTION) and new_transfer_status == CreditTransferStatuses.APPROVED:
            transfer_sent_back_to_analyst = True
        elif old_transfer_status == CreditTransferStatuses.APPROVED and new_transfer_status == CreditTransferStatuses.APPROVED:
            transfer_saved_by_analyst = True
        notifications_credit_transfers(transfer, transfer_sent_back_to_analyst, transfer_saved_by_analyst)

    @action(detail=True, methods=["PATCH"])
    def update_comment(self, request, pk):
        comment_id = request.data.get("comment_id")
        comment_text = request.data.get("comment_text")
        username = request.user.username
        comment = get_comment(comment_id)
        if username == comment.create_user:
            updated_comment = update_comment_text(comment, comment_text)
            serializer = CreditTransferCommentSerializer(updated_comment)
            return Response(serializer.data)
        return Response(status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=["PATCH"])
    def delete_comment(self, request, pk):
        comment_id = request.data.get("comment_id")
        username = request.user.username
        comment = get_comment(comment_id)
        if username == comment.create_user:
            delete_comment(comment_id)
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=["GET"])
    def org_balances(self, request, pk):
        transfer = self.get_queryset().filter(pk=pk).first()
        if transfer is None:
            return Response({})
        if request.user.is_government and transfer.status == CreditTransferStatuses.APPROVED:
            serializer = CreditTransferOrganizationBalancesSerializer(transfer)
            return Response(serializer.data)
        return Response(status=status.HTTP_403_FORBIDDEN)

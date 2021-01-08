import logging
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.permissions.credit_transfer import CreditTransferPermissions
from api.serializers.credit_transfer import CreditTransferSerializer, \
    CreditTransferSaveSerializer, CreditTransferListSerializer
from api.models.user_profile import UserProfile
from api.models.notification import Notification
from api.models.notification_subscription import NotificationSubscription
from auditable.views import AuditableMixin
from api.services.send_email import send_email
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
        email = None
        if transfer.status == CreditTransferStatuses.VALIDATED:
            #call service that updates transactions and balance tables
            validate_transfer(transfer)
            notifications = Notification.objects.values_list('id', flat=True).filter(Q(notification_code='CREDIT_TRANSFER_RECORDED_GOVT') | Q(notification_code='CREDIT_TRANSFER_RECORDED'))
    
        elif transfer.status == CreditTransferStatuses.RECOMMEND_APPROVAL:
            notifications = Notification.objects.values_list('id', flat=True).filter(notification_code='CREDIT_TRANSFER_RECOMMEND_APPROVAL') 

        elif transfer.status == CreditTransferStatuses.RECOMMEND_REJECTION:
            notifications = Notification.objects.values_list('id', flat=True).filter(notification_code='CREDIT_TRANSFER_RECOMMEND_REJECT') 
               
        elif transfer.status == CreditTransferStatuses.APPROVED:
            notifications = Notification.objects.values_list('id', flat=True).filter(Q(notification_code='CREDIT_TRANSFER_APPROVED') | Q(notification_code='CREDIT_TRANSFER_APPROVED_PARTNER'))

        elif transfer.status == CreditTransferStatuses.DISAPPROVED:
            notifications = Notification.objects.values_list('id', flat=True).filter(notification_code='CREDIT_TRANSFER_REJECT_PARTNER')

        elif transfer.status == CreditTransferStatuses.RESCINDED:
            notifications = Notification.objects.values_list('id', flat=True).filter(Q(notification_code='CREDIT_TRANSFER_RESCIND') | Q(notification_code='CREDIT_TRANSFER_RESCIND_PARTNER'))

        elif transfer.status == CreditTransferStatuses.RESCIND_PRE_APPROVAL:
            notifications = Notification.objects.values_list('id', flat=True).filter(notification_code='CREDIT_TRANSFER_RESCIND_PARTNER') 

        elif transfer.status == CreditTransferStatuses.REJECTED:
            notifications = Notification.objects.values_list('id', flat=True).filter(Q(notification_code='CREDIT_TRANSFER_REJECTED_GOVT') | Q(notification_code='CREDIT_TRANSFER_REJECTED'))
        """
        Send email to the users based on their notification subscription for a credit transfer
        """   
        try:
            subscribed_users = NotificationSubscription.objects.values_list('user_profile_id', flat=True).filter(notification__id__in=notifications)
            if subscribed_users:
                user_email = UserProfile.objects.values_list('email', flat=True).filter(id__in=subscribed_users).exclude(email__isnull=True).exclude(email__exact='')
                if user_email:
                    send_email(list(user_email))            
        except Exception as e:
            LOGGER.error('Email Failed! %s', e)  


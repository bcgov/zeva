import logging
from django.db.models import Q
from rest_framework import filters, mixins, status, permissions, viewsets
from rest_framework.response import Response
from auditable.views import AuditableMixin
from rest_framework.decorators import action

from api.models.notification import Notification
from django.http import HttpResponseBadRequest
from api.models.notification_subscription import NotificationSubscription
from api.serializers.notification import NotificationSerializer
from api.serializers.notification_subscription import NotificationSubscriptionSerializer

LOGGER = logging.getLogger(__name__)

class NotificationViewSet(
        AuditableMixin, 
        mixins.CreateModelMixin, 
        mixins.ListModelMixin,
        mixins.UpdateModelMixin, 
        viewsets.GenericViewSet
):
    """
    This viewset automatically provides `list`
    """
    permission_classes = (permissions.AllowAny,)
    http_method_names = ['get', 'post', 'put']
    queryset = Notification.objects.all()

    serializer_classes = {
        'default': NotificationSerializer,
        'create' : NotificationSubscriptionSerializer,
        'update' : NotificationSubscriptionSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def create(self, request, *args, **kwargs):
        notifications = request.data.get('notification')

        if not notifications:
            return HttpResponseBadRequest("No values passed")

        notification_delete = NotificationSubscription.objects.filter(user_profile_id= request.user.id)
        notification_delete.delete()
        notification_created = False
        try:
            for notification in notifications:
                notification_subscription = NotificationSubscription.objects.create(
                    notification=Notification.objects.get(id=notification),
                    user_profile_id=request.user.id
            )
            notification_subscription.save()
            notification_created = True

        except Exception as ex:
            LOGGER.error('ERROR! %s', ex)

        return Response(
            {'Status':notification_created}
        ) 
 
    @action(detail=False)
    def subscriptions(self, _request):
        notifications = NotificationSubscription.objects.values_list('notification_id', flat=True).filter(user_profile_id=_request.user.id)
        return Response(list(notifications))

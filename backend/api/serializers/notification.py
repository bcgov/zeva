from rest_framework.serializers import ModelSerializer, SlugRelatedField

from api.models.notification import Notification
from api.models.permission import Permission
from api.models.notification_subscription import NotificationSubscription



class NotificationSerializer(ModelSerializer):
    permission = SlugRelatedField(
        slug_field='permission_code',
        queryset=Permission.objects.all()
    )
    class Meta:
        model = Notification
        fields = (
            'id', 'notification_code', 'name', 'permission', 'description',
        )

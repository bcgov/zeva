from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.notification import Notification
from api.models.notification_subscription import NotificationSubscription
from api.serializers.notification import NotificationSerializer


class NotificationSubscriptionSerializer(ModelSerializer):
    notification = NotificationSerializer(read_only=True, many=True)

    class Meta:
        model = NotificationSubscription
        fields = (
            'id', 'user_profile_id', 'notification',
        )

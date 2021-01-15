from django.db import models
from auditable.models import Auditable


class NotificationSubscription(Auditable):
    """
    Relationship table between the users and notification. 
    """
    notification = models.ForeignKey(
        'Notification',
        related_name='notification_subscriptions',
        on_delete=models.CASCADE
    )
    user_profile = models.ForeignKey(
        'UserProfile',
        related_name='notification_subscriptions',
        on_delete=models.CASCADE
    )
   

    class Meta:
        db_table = 'notification_subscription'

    db_table_comment = "Relationship table between the users and notification"
                       

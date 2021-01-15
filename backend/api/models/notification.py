from django.db import models
from api.managers.notification import NoticationManager
from auditable.models import Auditable


class Notification(Auditable):
    """
    Contains information about the different notification types and which user(IDIR or Supplier) can get that notification.
    """
    notification_code = models.CharField(
        max_length=100,
        unique=True,
        db_comment="Notification code. Natural key."
    )
    name = models.CharField(
        max_length=100,
        db_comment="Short description of the notification."
    )
    description = models.CharField(
        max_length=1000,
        db_comment="More detailed description of the notification."
    )
    permission = models.ForeignKey(
        'Permission',
        related_name='notifications',
        on_delete=models.CASCADE)

    objects = NoticationManager()

    def natural_key(self):
        """
        Allows code to be used to identify a row in the table.
        """
        return (self.code,)

    class Meta:
        db_table = 'notification'

    db_table_comment = "Contains information about the different notification types and " \
                       "which user(IDIR or Supplier) can get that notification" 
                       

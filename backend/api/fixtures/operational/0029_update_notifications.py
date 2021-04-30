from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.notification import Notification


class UpdateNotifications(OperationalDataScript):
    """
    Update notifications name
    """
    is_revertable = False
    comment = 'Update notifications name'

    def check_run_preconditions(self):
        return True

    def update_notifications(self):
        notification = Notification.objects.get(notification_code="CREDIT_APPLICATION_ISSUED")
        notification.name = "Credit Application Processed by the Government of B.C"
        notification.save()
        notification = Notification.objects.get(notification_code="CREDIT_TRANSFER_RECORDED")
        notification.name = "Credit Transfer Recorded by the Government of B.C."
        notification.save()
        notification = Notification.objects.get(notification_code="CREDIT_TRANSFER_REJECTED")
        notification.name = "Credit Transfer Rejected by the Government of B.C."
        notification.save()

    @transaction.atomic
    def run(self):
        self.update_notifications()


script_class = UpdateNotifications

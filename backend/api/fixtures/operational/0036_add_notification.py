from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.notification import Notification
from api.models.permission import Permission

class AddNotification(OperationalDataScript):
    """
    Add the Notification
    """
    is_revertable = False
    comment = 'Add the Notification'

    def check_run_preconditions(self):
        return True

    def add_notification(self):
        Notification.objects.get_or_create(
            notification_code='MODEL_YEAR_REPORT_RETURNED_TO_SUPPLIER',
            permission= Permission.objects.get(permission_code='VIEW_BCEID_NOTIFICATIONS'),
            defaults={
                'name': 'Model Year Report Returned by the Government of B.C.',
                'description': 'when government returns the model year report to the supplier'
            }
        )

    @transaction.atomic
    def run(self):
        self.add_notification()

        print('Added Notification')


script_class = AddNotification
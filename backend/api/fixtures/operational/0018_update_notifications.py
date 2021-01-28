from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.notification import Notification
from api.models.permission import Permission
from api.authorities import REQUIRED_AUTHORITIES


class UpdateNotifications(OperationalDataScript):
    """
    Update the Notifications
    """
    is_revertable = False
    comment = 'Update the Notifications'

    def check_run_preconditions(self):
        return True

    def add_notifications(self):
        
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_SUBMITTED",
            permission=Permission.objects.get(permission_code="CREATE_CREDIT_TRANSFERS"),
            defaults={
                'name': 'Credit Transfer to Review',
                'description': "when supplier submits a credit transfer"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_RESCINDED_PARTNER",
            permission=Permission.objects.get(permission_code="CREATE_CREDIT_TRANSFERS"),
            defaults={
                'name': 'Credit Transfer Rescinded by Transfer Partner',
                'description': "when transfer partner rescind a credit transfer"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_REJECTED_PARTNER",
            permission=Permission.objects.get(permission_code="CREATE_CREDIT_TRANSFERS"),
            defaults={
                'name': 'Credit Transfer Rejected by Transfer Partner',
                'description': "when transfer partner reject a credit transfer"
            }
        )
        Notification.objects.get_or_create(
            notification_code="ZEV_MODEL_RANGE_REPORT_TEST_RESULT_REQUESTED",
            permission=Permission.objects.get(permission_code="CREATE_ZEV"),
            defaults={
                'name': 'ZEV Model Request for Range Change / Test Results',
                'description': "when government request range report or test results for a zev model"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_RESCINDED",
            permission=Permission.objects.get(permission_code="RECOMMEND_CREDIT_TRANSFER"),
            defaults={
                'name': 'Credit Transfer Rescinded by Supplier',
                'description': "when supplier rescinds transfer"
            }
        )

    def delete_notifications(self):
        notifications_to_be_deleted = [
            'ZEV_MODEL_RANGE_REPORT_REQUESTED',
            'ZEV_MODEL_TEST_RESULTS_REQUESTED',
            'CREDIT_TRANSFER_RESCIND_PARTNER',
            'CREDIT_TRANSFER_REJECT_PARTNER',
            'CREDIT_TRANSFER_RESCIND'
        ]
        Notification.objects.filter(
            notification_code__in=notifications_to_be_deleted
        ).delete()
   
    @transaction.atomic
    def run(self):
        self.delete_notifications()
        self.add_notifications()

        print('Updated Notifications')


script_class = UpdateNotifications

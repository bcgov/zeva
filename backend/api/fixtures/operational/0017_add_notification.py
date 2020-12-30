from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.notification import Notification
from api.models.permission import Permission
from api.authorities import REQUIRED_AUTHORITIES


class AddNotification(OperationalDataScript):
    """
    Adds the Notifications
    """
    is_revertable = False
    comment = 'Add the Notifications'

    def check_run_preconditions(self):
        return True

    def add_notifications(self):
        Notification.objects.get_or_create(
            notification_code='ZEV_MODEL_SUBMITTED',
            permission= Permission.objects.get(permission_code='VALIDATE_ZEV'),
            defaults={
                'name': 'ZEV Model to Validate',
                'description': 'when supplier submits new ZEV Model'
            }
        )
        Notification.objects.get_or_create(
            notification_code="ZEV_MODEL_RANGE_REPORT_SUBMITTED",
            permission= Permission.objects.get(permission_code="REQUEST_ZEV_CHANGES"),
            defaults={
                'name': 'ZEV Range Test Results Received',
                'description': "when supplier re-submits with changes or range report"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_APPROVED",
            permission= Permission.objects.get(permission_code="RECOMMEND_CREDIT_TRANSFER"),
            defaults={
                'name': 'Credit Transfer to Review',
                'description': " when transfer partner approves credit transfer"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_RESCIND",
            permission= Permission.objects.get(permission_code="RECOMMEND_CREDIT_TRANSFER"),
            defaults={
                'name': 'Credit Transfer Rescinded by Supplier',
                'description': "when supplier rescinds transfer"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_APPLICATION_SUBMITTED",
            permission= Permission.objects.get(permission_code="RECOMMEND_SALES"),
            defaults={
                'name': 'Credit Application to Review',
                'description': "when supplier submits application"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_APPLICATION_CHECKED",
            permission= Permission.objects.get(permission_code="VALIDATE_SALES"),
            defaults={
                'name': 'Credit Application Returned by the Director with Comment',
                'description': "when director returns application to analyst"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_APPLICATION_ISSUED",
            permission= Permission.objects.get(permission_code="RECOMMEND_SALES"),
            defaults={
                'name': 'Credit Application issued by the Director',
                'description': "when director approves application"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_RECORDED",
            permission= Permission.objects.get(permission_code="RECOMMEND_CREDIT_TRANSFER"),
            defaults={
                'name': 'Credit Transfer Recorded by the Director',
                'description': "when director record the credit transfer"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_REJECTED",
            permission= Permission.objects.get(permission_code="RECOMMEND_CREDIT_TRANSFER"),
            defaults={
                'name': 'Credit Transfer Rejected by the Director',
                'description': "when director reject the credit transfer"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_RECOMMEND_APPROVAL",
            permission= Permission.objects.get(permission_code="SIGN_CREDIT_TRANSFERS"),
            defaults={
                'name': 'Credit Transfer to Record',
                'description': "when analyst recommend approval for credit transfer"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_TRANSFER_RECOMMEND_REJECT",
            permission= Permission.objects.get(permission_code="DECLINE_CREDIT_TRANSFERS"),
            defaults={
                'name': 'Credit Transfer to Reject',
                'description': "when analyst recommend rejection for credit transfer"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_APPLICATION_RECOMMEND_APPROVAL",
            permission= Permission.objects.get(permission_code="SIGN_SALES"),
            defaults={
                'name': 'Credit Application to Issue',
                'description': "when analyst recommend approval for credit application"
            }
        )
    

    @transaction.atomic
    def run(self):
        self.add_notifications()

        print('added Notifications')


script_class = AddNotification

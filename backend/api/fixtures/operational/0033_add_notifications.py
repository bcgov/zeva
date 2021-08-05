from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.notification import Notification
from api.models.permission import Permission
from api.authorities import REQUIRED_AUTHORITIES


class AddNotifications(OperationalDataScript):
    """
    Adds the Notifications
    """
    is_revertable = False
    comment = 'Add the Notifications'

    def check_run_preconditions(self):
        return True

    def add_notifications(self):
        Notification.objects.get_or_create(
            notification_code='MODEL_YEAR_REPORT_ASSESSED_SUPPLIER',
            permission= Permission.objects.get(permission_code='VIEW_BCEID_NOTIFICATIONS'),
            defaults={
                'name': 'Model Year Report Assessed by the Government of B.C.',
                'description': 'when government assess model year report'
            }
        )
        Notification.objects.get_or_create(
            notification_code="MODEL_YEAR_REPORT_SUBMITTED",
            permission= Permission.objects.get(permission_code="RECOMMEND_COMPLIANCE_REPORT"),
            defaults={
                'name': 'Model Year Report to Review',
                'description': "when supplier submits the report"
            }
        )
        Notification.objects.get_or_create(
            notification_code="MODEL_YEAR_REPORT_RETURNED",
            permission= Permission.objects.get(permission_code="RECOMMEND_COMPLIANCE_REPORT"),
            defaults={
                'name': 'Model Year Report Returned by the Director with Comment',
                'description': " when director return model year report back to analyst"
            }
        )
        Notification.objects.get_or_create(
            notification_code="MODEL_YEAR_REPORT_ASSESSED_GOVT",
            permission= Permission.objects.get(permission_code="RECOMMEND_COMPLIANCE_REPORT"),
            defaults={
                'name': 'Model Year Report Issued by the Director',
                'description': "when director issue model year report"
            }
        )
        Notification.objects.get_or_create(
            notification_code="MODEL_YEAR_REPORT_RECOMMENDED",
            permission= Permission.objects.get(permission_code="SIGN_COMPLIANCE_REPORT"),
            defaults={
                'name': 'Model Year Report to Assess',
                'description': "when analyst recommend model year report to the director"
            }
        )
        Notification.objects.get_or_create(
            notification_code='CREDIT_AGREEMENT_ISSUED_SUPPLIER',
            permission= Permission.objects.get(permission_code='VIEW_BCEID_NOTIFICATIONS'),
            defaults={
                'name': 'Initiative or Purchase Agreement Issued by the Government of B.C.',
                'description': 'when government issue initiative or purchase agreement'
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_AGREEMENT_RETURNED_WITH_COMMENT",
            permission= Permission.objects.get(permission_code="RECOMMEND_INITIATIVE_AGREEMENTS"),
            defaults={
                'name': 'Credit Adjustment, Agreement or Penalty Returned by the Director with Comment',
                'description': "when director return agreement to analyst"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_AGREEMENT_ISSUED_GOVT",
            permission= Permission.objects.get(permission_code="RECOMMEND_INITIATIVE_AGREEMENTS"),
            defaults={
                'name': 'Credit Adjustment, Agreement or Penalty Issued by the Director',
                'description': "when director issue the agreement"
            }
        )
        Notification.objects.get_or_create(
            notification_code="CREDIT_AGREEMENT_RECOMMENDED",
            permission= Permission.objects.get(permission_code="SIGN_INITIATIVE_AGREEMENTS"),
            defaults={
                'name': 'Credit Adjustment, Agreement or Penalty to Issue',
                'description': "when analyst recommend agreement"
            }
        )
       

    @transaction.atomic
    def run(self):
        self.add_notifications()

        print('Added Notifications')


script_class = AddNotifications

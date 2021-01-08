from django.core.management import BaseCommand

from api.models.user_profile import UserProfile
from api.services.user import create_default_user_notification_settings


class Command(BaseCommand):
    help = 'Enable all notifications for existing users in the system.' \
           'This will only enable notifications that are available to them.'

    def handle(self, *args, **options):
        users = UserProfile.objects.all()

        for user in users:
            create_default_user_notification_settings(user)

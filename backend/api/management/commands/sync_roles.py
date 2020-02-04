from django.core.management import BaseCommand
from django.db import transaction, connection

from api.management.commands._loader import ScriptLoader
from api.models.organization import Organization
from api.models.user_profile import UserProfile
from api.services.keycloak_api import get_token, list_roles, list_roles_for_username, create_role, \
    update_role_description

REQUIRED_ROLES = [
    {'name': 'government', 'description': 'Government Role'},
    {'name': 'vehicle_supplier', 'description': 'Vehicle Supplier Role'},
    {'name': 'view_roles', 'description': 'View the list of roles'},
    {'name': 'manage_users', 'description': 'Manage an organization\'s users'},
    {'name': 'validate_vehicles', 'description': 'Validate vehicle descriptions'},
]


class Command(BaseCommand):
    help = 'Synchronize roles with keycloak'

    def add_arguments(self, parser):
        parser.add_argument('--dryrun', action='store_true', help='only show what would be done')
        parser.add_argument('--assign', action='store_true', help='assign government role to active government users '
                                                                  'and vehicle_supplier role to vehicle_supplier users')

        helptext = ('Synchronize Keycloak roles with application roles')

        parser.description = helptext

    def handle(self, *args, **options):
        dry_run = 'dryrun' in options and options['dryrun'] is True
        assign = 'assign' in options and options['assign'] is True

        if dry_run:
            self.stdout.write(self.style.SUCCESS('Dry run'))

        token = get_token()
        self.stdout.write(self.style.SUCCESS('connected to keycloak successfully'))

        unmatched_local = 0
        roles_keycloak_has = list_roles(token)
        for role in roles_keycloak_has:
            self.stdout.write(self.style.SUCCESS('Keycloak already has role: {}'.format(role['name'])))
            matching_local_roles = list(filter(lambda r: r['name'] == role['name'], REQUIRED_ROLES))
            if len(matching_local_roles) == 0:
                unmatched_local += 1
                self.stdout.write(self.style.WARNING('We have no local role called {}'.format(role['name'])))

        if unmatched_local > 0:
            self.stdout.write(self.style.WARNING('{count} unmatched roles. Not going to touch'
                                                 ' them. You may need to manually remove them from Keycloak'
                                                 .format(count=unmatched_local)))

        for role in REQUIRED_ROLES:
            matching_keycloak_roles = list(filter(lambda r: r['name'] == role['name'], roles_keycloak_has))
            if len(matching_keycloak_roles) == 1:
                remote_role = matching_keycloak_roles[0]
                if remote_role['description'] != role['description']:
                    self.stdout.write(self.style.WARNING('Remote description of role {} not identical to ours.'
                                                         ' Will patch it.'.format(role['name'])))
                    if not dry_run:
                        update_role_description(token, role['name'], role['description'])

            if len(matching_keycloak_roles) == 0:
                self.stdout.write(self.style.WARNING('Role {} does not exist in Keycloak. Will create it.'
                                                     .format(role['name'])))
                if not dry_run:
                    create_role(token, role['name'], role['description'])

        if assign:
            users = UserProfile.objects.filter(organization__is_government=True)
            for user in users:
                self.stdout.write(self.style.SUCCESS('Checking gov user: {}'.format(user.username)))
                keycloak_roles_for_user = list_roles_for_username(token, user.username)
                matching_roles = list(filter(lambda r: r['name'] == 'government', keycloak_roles_for_user))
                if len(matching_roles) == 0:
                    self.stdout.write(self.style.WARNING('User {} not mapped to government role in Keycloak. Will map.'
                                                         .format(user.username)))

            users = UserProfile.objects.filter(organization__is_government=False)
            for user in users:
                self.stdout.write(self.style.SUCCESS('Checking vehicle supplier user: {}'.format(user.username)))
                keycloak_roles_for_user = list_roles_for_username(token, user.username)
                matching_roles = list(filter(lambda r: r['name'] == 'vehicle_supplier', keycloak_roles_for_user))
                if len(matching_roles) == 0:
                    self.stdout.write(self.style.WARNING('User {} not mapped to vehicle_supplier role in Keycloak.'
                                                         ' Will map.'
                                                         .format(user.username)))

        self.stdout.write(self.style.SUCCESS('Sync complete'))

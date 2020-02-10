from collections import namedtuple

from django.core.management import BaseCommand

from api.authorities import REQUIRED_AUTHORITIES
from api.services.keycloak_api import get_token, list_roles, create_role, \
    update_role_description, get_group_id, GroupNotFoundError, create_group, \
    list_groups, get_group_details, map_group_into_role, delete_role, delete_group_by_id

class Command(BaseCommand):

    help = 'Synchronize roles with keycloak'

    def __init__(self):

        super().__init__()
        self.distinct_roles = {}
        self.distinct_groups = {}
        self.distinct_roots = {}
        self.dry_run = True
        self.delete_groups = False
        self.delete_roles = False

    def add_arguments(self, parser):
        parser.add_argument('--dryrun', action='store_true', help='only show what would be done')

        parser.add_argument('--delete-roles', action='store_true',
                            help='delete roles that are not in the mapping list (DANGER)')
        parser.add_argument('--delete-groups', action='store_true',
                            help='delete groups that are not in the mapping list (DANGER)')

        helptext = ('Synchronize Keycloak roles with application roles',)

        parser.description = helptext

    def handle(self, *args, **options):
        self.dry_run = 'dryrun' in options and options['dryrun'] is True
        self.delete_roles = 'delete_roles' in options and options['delete_roles'] is True
        self.delete_groups = 'delete_groups' in options and options['delete_groups'] is True

        if self.dry_run:
            self.stdout.write(self.style.SUCCESS('Dry run'))

        self.prepare_data()

        self.sync_roles_to_keycloak()

        self.sync_groups_to_keycloak()

        self.stdout.write(self.style.SUCCESS('Sync complete'))

    def prepare_data(self):

        self.distinct_roles = {}
        self.distinct_groups = {}
        self.distinct_roots = {}

        for auth in REQUIRED_AUTHORITIES:
            if auth.root is not None:
                if auth.root not in self.distinct_roots:
                    self.distinct_roots[auth.root] = {
                        'name': auth.root,
                        'groups': [auth.group]
                    }
                else:
                    self.distinct_roots[auth.root]['groups'].append(auth.group)

            if auth.role not in self.distinct_roles:
                self.distinct_roles[auth.role] = {
                    'name': auth.role,
                    'description': auth.description
                }

            if auth.group not in self.distinct_groups:
                self.distinct_groups[auth.group] = {
                    'name': auth.group,
                    'parent': auth.root,
                    'roles': [auth.role]
                }
            else:
                self.distinct_groups[auth.group]['roles'].append(auth.role)

        self.stdout.write(self.style.SUCCESS('mapping distinct roles: {}'.format(self.distinct_roles.values())))
        self.stdout.write(self.style.SUCCESS('mapping distinct groups: {}'.format(self.distinct_groups.values())))
        self.stdout.write(self.style.SUCCESS('mapping distinct roots: {}'.format(self.distinct_roots.values())))

    def sync_roles_to_keycloak(self):
        unmatched_local = []
        roles_keycloak_has = list_roles(get_token())
        for role in roles_keycloak_has:
            self.stdout.write(self.style.SUCCESS('Keycloak already has role: {}'.format(role['name'])))
            matching_local_roles = list(filter(lambda r: r['name'] == role['name'], self.distinct_roles.values()))
            if len(matching_local_roles) == 0:
                unmatched_local.append(role['name'])
                self.stdout.write(self.style.WARNING('We have no local role called {}'.format(role['name'])))

        self.stdout.write(self.style.ERROR(unmatched_local))

        if len(unmatched_local) > 0:
            if self.delete_roles and not self.dry_run:
                for role in unmatched_local:
                    self.stdout.write(self.style.WARNING('deleting role {role} from keycloak'.format(role=role)))
                    delete_role(get_token(), role)
            else:
                self.stdout.write(self.style.WARNING('{count} unmatched roles. Not going to touch'
                                                     ' them. You may need to manually remove them from Keycloak'
                                                     .format(count=len(unmatched_local))))

        for role in self.distinct_roles.values():
            matching_keycloak_roles = list(filter(lambda r: r['name'] == role['name'], roles_keycloak_has))
            if len(matching_keycloak_roles) == 1:
                remote_role = matching_keycloak_roles[0]
                if remote_role['description'] != role['description']:
                    self.stdout.write(self.style.WARNING('Remote description of role {} not identical to ours.'
                                                         ' Will patch it.'.format(role['name'])))
                    if not self.dry_run:
                        update_role_description(get_token(), role['name'], role['description'])

            if len(matching_keycloak_roles) == 0:
                self.stdout.write(self.style.WARNING('Role {} does not exist in Keycloak. Will create it.'
                                                     .format(role['name'])))
                if not self.dry_run:
                    create_role(get_token(), role['name'], role['description'])

    def sync_groups_to_keycloak(self):
        groups = list_groups(get_token())
        self.stdout.write(self.style.SUCCESS('keycloak existing groups:'))
        self.stdout.write(self.style.SUCCESS(groups))

        for root in self.distinct_roots.values():
            try:
                existing_group = get_group_id(get_token(), root['name'])
                details = get_group_details(get_token(), existing_group)
                self.stdout.write(self.style.SUCCESS(details))
            except GroupNotFoundError:
                self.stdout.write(
                    self.style.WARNING(('root group {} does not exist in Keycloak. Will create.'.format(root['name']))))
                if not self.dry_run:
                    create_group(get_token(), root['name'])

        for group in self.distinct_groups.values():
            already_mapped_roles = []
            try:
                existing_group = get_group_id(get_token(), group['name'])
                details = get_group_details(get_token(), existing_group)
                already_mapped_roles = [r['name'] for r in details['roles']]
                self.stdout.write(self.style.SUCCESS(details))
            except GroupNotFoundError:
                self.stdout.write(
                    self.style.WARNING(('group {} does not exist in Keycloak. Will create.'.format(group['name']))))
                if not self.dry_run:
                    create_group(get_token(), group['name'], parent=group['parent'])

            local_roles = group['roles']

            for role in already_mapped_roles:
                if role not in local_roles:
                    self.stdout.write(self.style.WARNING((
                        'group {} has extra role {}. you will need to manually unmap this in Keycloak'
                            .format(group['name'], role))
                    ))

            for role in local_roles:
                if role in already_mapped_roles:
                    pass
                else:
                    self.stdout.write(
                        self.style.WARNING(('group {} needs role {}. Will map'.format(group['name'], role))))
                    if not self.dry_run:
                        map_group_into_role(get_token(), group['name'], role)

        groups_keycloak_has = list_groups(get_token())

        for group in groups_keycloak_has:
            if group['name'] not in self.distinct_roots.keys() and group['name'] not in self.distinct_groups.keys():
                self.stdout.write(
                    self.style.WARNING('keycloak has extraneous group {group}'.format(group=group['name']))
                )
                if self.delete_groups and not self.dry_run:
                    self.stdout.write(
                        self.style.WARNING('issuing delete for group {group}'.format(group=group['name']))
                    )
                    delete_group_by_id(get_token(), group['id'])

from collections import namedtuple

from django.core.management import BaseCommand
from django.db import transaction, connection

from api.management.commands._loader import ScriptLoader
from api.models.organization import Organization
from api.models.user_profile import UserProfile
from api.services.keycloak_api import get_token, list_roles, list_roles_for_username, create_role, \
    update_role_description, map_user_into_role, UserNotFoundError, get_group_id, GroupNotFoundError, create_group, \
    list_groups, get_group_details, map_group_into_role

Authority = namedtuple('Authority', ('group', 'role', 'description'))

REQUIRED_AUTHORITIES = [
    Authority('Administrator (IDIR)', 'View Dashboard', 'can view dashboard tasks and reports filtered by user role'),
    Authority('Administrator (IDIR)', 'View Roles and Permissions', 'can view roles and permissions information'),
    Authority('Administrator (IDIR)', 'View Organizations', 'can view organization information'),
    Authority('Administrator (IDIR)', 'Create Organizations', 'can create new organizations'),
    Authority('Administrator (IDIR)', 'Edit Organizations', 'can edit organization information'),
    Authority('Administrator (IDIR)', 'Delete Organizations', 'can hide/disable organizations'),
    Authority('Administrator (IDIR)', 'View Users', 'can view user information'),
    Authority('Administrator (IDIR)', 'Create Users', 'can create new users'),
    Authority('Administrator (IDIR)', 'Edit Users', 'can edit user information'),
    Authority('Administrator (IDIR)', 'Delete Users', 'can hide/disable users'),
    Authority('Administrator (IDIR)', 'Assign IDIR Roles', 'can assign roles to government (IDIR) users'),
    Authority('Administrator (IDIR)', 'Assign BCeID Roles', 'can assign roles to external (BCeID) users'),
    Authority('Director (IDIR)', 'View Dashboard', 'can view dashboard tasks and reports filtered by user role'),
    Authority('Director (IDIR)', 'View Organizations', 'can view organization information'),
    Authority('Director (IDIR)', 'View Users', 'can view user information'),
    Authority('Director (IDIR)', 'View ZEV', 'can view ZEV model information'),
    Authority('Director (IDIR)', 'View Sales', 'can view sales submissions for early credits'),
    Authority('Director (IDIR)', 'Sign Sales', 'can approve and sign a sales submission for early credits'),
    Authority('Director (IDIR)', 'Decline Sales', 'can decline to approve a sales submission for early credits'),
    Authority('Director (IDIR)', 'View Credit Transfers', 'can view credit transfers'),
    Authority('Director (IDIR)', 'Sign Credit Transfers', 'can approve and sign a credit transfers'),
    Authority('Director (IDIR)', 'Decline Credit Transfers', 'can decline to approve a credit transfers'),
    Authority('Director (IDIR)', 'View Compliance Reports', 'can view compliance reports'),
    Authority('Director (IDIR)', 'Sign Compliance Report', 'can accept and sign a compliance report'),
    Authority('Director (IDIR)', 'Reject Compliance Report', 'can reject a compliance report'),
    Authority('Director (IDIR)', 'View Initiative Agreements', 'can view initiative agreements'),
    Authority('Director (IDIR)', 'Sign Initiative Agreements', 'can approve and sign an initiative agreements'),
    Authority('Director (IDIR)', 'Decline Initiative Agreements', 'can decline to approve an initiative agreements'),
    Authority('Director (IDIR)', 'View Purchase Requests', 'can view credit purchase requests'),
    Authority('Director (IDIR)', 'Sign Purchase Requests', 'can approve and sign a purchase requests'),
    Authority('Director (IDIR)', 'Decline Purchase Requests', 'can decline to approve a purchase requests'),
    Authority('Director (IDIR)', 'View File Submissions', 'can view and download files that have been uploaded'),
    Authority('Engineer/Analyst (IDIR)', 'View Dashboard',
              'can view dashboard tasks and reports filtered by user role'),
    Authority('Engineer/Analyst (IDIR)', 'View ZEV', 'can view ZEV model information'),
    Authority('Engineer/Analyst (IDIR)', 'Create ZEV', 'can create new ZEV models'),
    Authority('Engineer/Analyst (IDIR)', 'Edit ZEV', 'can edit ZEV model information'),
    Authority('Engineer/Analyst (IDIR)', 'Delete ZEV', 'can hide/disable ZEV models'),
    Authority('Engineer/Analyst (IDIR)', 'Validate ZEV', 'can validate/unvalidate ZEV models'),
    Authority('Engineer/Analyst (IDIR)', 'View Sales', 'can view sales submissions for early credits'),
    Authority('Engineer/Analyst (IDIR)', 'Create Sales', 'can create a new sales submission for early credits'),
    Authority('Engineer/Analyst (IDIR)', 'Edit Sales', 'can edit sales submission for early credits'),
    Authority('Engineer/Analyst (IDIR)', 'Delete Sales', 'can hide/disable sales submission for early credits'),
    Authority('Engineer/Analyst (IDIR)', 'Recommend Sales',
              'can recommend approval or rejection of a sales submission for early credits'),
    Authority('Engineer/Analyst (IDIR)', 'View Credit Transfers', 'can view credit transfer proposals'),
    Authority('Engineer/Analyst (IDIR)', 'Create Credit Transfer', 'can create a new credit transfer proposal'),
    Authority('Engineer/Analyst (IDIR)', 'Edit Credit Transfers', 'can edit credit transfer proposals'),
    Authority('Engineer/Analyst (IDIR)', 'Delete Credit Transfers', 'can hide/disable credit transfer proposals'),
    Authority('Engineer/Analyst (IDIR)', 'Recommend Credit Transfer',
              'can recommend approval or rejection of a credit transfer proposal'),
    Authority('Engineer/Analyst (IDIR)', 'View Compliance Reports', 'can view compliance reports'),
    Authority('Engineer/Analyst (IDIR)', 'Create Compliance Reports', 'can create a new compliance report'),
    Authority('Engineer/Analyst (IDIR)', 'Edit Compliance Reports', 'can edit compliance reports'),
    Authority('Engineer/Analyst (IDIR)', 'Delete Compliance Reports', 'can hide/disable compliance reports'),
    Authority('Engineer/Analyst (IDIR)', 'Recommend Compliance Report',
              'can recommend acceptance or rejection of a compliance report'),
    Authority('Engineer/Analyst (IDIR)', 'View Initiative Agreements', 'can view initiative agreements'),
    Authority('Engineer/Analyst (IDIR)', 'Create Initiative Agreements', 'can create a new initiative agreement'),
    Authority('Engineer/Analyst (IDIR)', 'Edit Initiative Agreements', 'can edit initiative agreements'),
    Authority('Engineer/Analyst (IDIR)', 'Delete Initiative Agreements', 'can hide/disable initiative agreements'),
    Authority('Engineer/Analyst (IDIR)', 'Recommend Initiative Agreements',
              'can recommend approval or rejection of an initiative agreements'),
    Authority('Engineer/Analyst (IDIR)', 'View Purchase Requests', 'can view credit purchase requests'),
    Authority('Engineer/Analyst (IDIR)', 'Create Purchase Requests', 'can create a new purchase request'),
    Authority('Engineer/Analyst (IDIR)', 'Edit Purchase Requests', 'can edit purchase requests'),
    Authority('Engineer/Analyst (IDIR)', 'Delete Purchase Requests', 'can hide/disable purchase requests'),
    Authority('Engineer/Analyst (IDIR)', 'Recommend Purchase Requests',
              'can recommend approval or rejection of a purchase requests'),
    Authority('Engineer/Analyst (IDIR)', 'View File Submissions',
              'can view and download files that have been uploaded'),
    Authority('Organization Administrator (BCeID)', 'View Dashboard',
              'can view dashboard tasks and reports filtered by user role'),
    Authority('Organization Administrator (BCeID)', 'View Roles and Permissions',
              'can view roles and permissions information'),
    Authority('Organization Administrator (BCeID)', 'View Organization Information',
              'can view organization information'),
    Authority('Organization Administrator (BCeID)', 'Edit Organization Information',
              'can edit organization information'),
    Authority('Organization Administrator (BCeID)', 'View Users', 'can view user information'),
    Authority('Organization Administrator (BCeID)', 'Create Users', 'can create new users'),
    Authority('Organization Administrator (BCeID)', 'Edit Users', 'can edit user information'),
    Authority('Organization Administrator (BCeID)', 'Delete Users', 'can delete/disable users'),
    Authority('Organization Administrator (BCeID)', 'Assign BCeID Roles', 'can assign roles to external (BCeID) users'),
    Authority('Signing Authority (BCeID)', 'View Dashboard',
              'can view dashboard tasks and reports filtered by user role'),
    Authority('Signing Authority (BCeID)', 'View Organization Information', 'can view organization information'),
    Authority('Signing Authority (BCeID)', 'Submit ZEV', 'can submit new ZEV models to be validated by government'),
    Authority('Signing Authority (BCeID)', 'Submit Sales', 'can submit a sales submission for early credits'),
    Authority('Signing Authority (BCeID)', 'Submit Credit Transfer Proposal',
              'can sign and submit a credit transfer proposal for government approval'),
    Authority('Signing Authority (BCeID)', 'Submit Compliance Report',
              'can sign and submit a compliance report for government acceptance'),
    Authority('Signing Authority (BCeID)', 'Submit Initiative Agreements',
              'can sign and submit an initiative agreement for government approval'),
    Authority('Signing Authority (BCeID)', 'Submit Purchase Requests',
              'can sign and submit a purchase requests for government approval'),
    Authority('Manage ZEV (BCeID)', 'View Dashboard', 'can view dashboard tasks and reports filtered by user role'),
    Authority('Manage ZEV (BCeID)', 'View Organization Information', 'can view organization information'),
    Authority('Manage ZEV (BCeID)', 'View ZEV', 'can view ZEV model information'),
    Authority('Manage ZEV (BCeID)', 'Create ZEV', 'can create new ZEV models'),
    Authority('Manage ZEV (BCeID)', 'Edit ZEV', 'can edit ZEV model information'),
    Authority('Manage ZEV (BCeID)', 'Delete ZEV', 'can hide/disable ZEV models'),
]


class Command(BaseCommand):
    help = 'Synchronize roles with keycloak'

    def add_arguments(self, parser):
        parser.add_argument('--dryrun', action='store_true', help='only show what would be done')
        parser.add_argument('--assign', action='store_true', help='assign government role to active government users '
                                                                  'and vehicle_supplier role to vehicle_supplier users')

        helptext = ('Synchronize Keycloak roles with application roles',)

        parser.description = helptext

    def handle(self, *args, **options):
        dry_run = 'dryrun' in options and options['dryrun'] is True
        assign = 'assign' in options and options['assign'] is True

        if dry_run:
            self.stdout.write(self.style.SUCCESS('Dry run'))

        self.stdout.write(self.style.SUCCESS('connected to keycloak successfully'))

        distinct_roles = {}
        distinct_groups = {}

        for auth in REQUIRED_AUTHORITIES:
            if auth.role not in distinct_roles:
                distinct_roles[auth.role] = {
                    'name': auth.role,
                    'description': auth.description
                }
            if auth.group not in distinct_groups:
                distinct_groups[auth.group] = {
                    'name': auth.group,
                    'roles': [auth.role]
                }
            else:
                distinct_groups[auth.group]['roles'].append(auth.role)

        self.stdout.write(self.style.SUCCESS('mapping distinct roles: {}'.format(distinct_roles.values())))
        self.stdout.write(self.style.SUCCESS('mapping distinct groups: {}'.format(distinct_groups.values())))

        unmatched_local = 0
        roles_keycloak_has = list_roles(get_token())
        for role in roles_keycloak_has:
            self.stdout.write(self.style.SUCCESS('Keycloak already has role: {}'.format(role['name'])))
            matching_local_roles = list(filter(lambda r: r['name'] == role['name'], distinct_roles.values()))
            if len(matching_local_roles) == 0:
                unmatched_local += 1
                self.stdout.write(self.style.WARNING('We have no local role called {}'.format(role['name'])))

        if unmatched_local > 0:
            self.stdout.write(self.style.WARNING('{count} unmatched roles. Not going to touch'
                                                 ' them. You may need to manually remove them from Keycloak'
                                                 .format(count=unmatched_local)))

        for role in distinct_roles.values():
            matching_keycloak_roles = list(filter(lambda r: r['name'] == role['name'], roles_keycloak_has))
            if len(matching_keycloak_roles) == 1:
                remote_role = matching_keycloak_roles[0]
                if remote_role['description'] != role['description']:
                    self.stdout.write(self.style.WARNING('Remote description of role {} not identical to ours.'
                                                         ' Will patch it.'.format(role['name'])))
                    if not dry_run:
                        update_role_description(get_token(), role['name'], role['description'])

            if len(matching_keycloak_roles) == 0:
                self.stdout.write(self.style.WARNING('Role {} does not exist in Keycloak. Will create it.'
                                                     .format(role['name'])))
                if not dry_run:
                    create_role(get_token(), role['name'], role['description'])

        groups = list_groups(get_token())
        self.stdout.write(self.style.WARNING('groups:'))
        self.stdout.write(self.style.ERROR(groups))

        for group in distinct_groups.values():
            existing_group = None
            already_mapped_roles = []
            try:
                existing_group = get_group_id(get_token(), group['name'])
                details = get_group_details(get_token(), existing_group)
                already_mapped_roles = details['roles']
                self.stdout.write(self.style.ERROR(details))
            except GroupNotFoundError:
                self.stdout.write(
                    self.style.WARNING(('group {} does not exist in Keycloak. Will create.'.format(group['name']))))
                if not dry_run:
                    create_group(get_token(), group['name'])

            for role in already_mapped_roles:
                if role['name'] in group['roles']:
                    self.style.WARNING(('group {} already has role {}'.format(group['name'], role['name'])))
                else:
                    if not dry_run:
                        self.style.WARNING(('group {} needs role {}. Will map'.format(group['name'], role['name'])))
                        map_group_into_role(get_token(), group['name'], role['name'])
                        # look for extraneous roles


        #
        # if assign:
        #     users = UserProfile.objects.filter(organization__is_government=True)
        #     for user in users:
        #         self.stdout.write(self.style.SUCCESS('Checking gov user: {}'.format(user.username)))
        #         keycloak_roles_for_user = list_roles_for_username(get_token(), user.username)
        #         matching_roles = list(filter(lambda r: r['name'] == 'government', keycloak_roles_for_user))
        #         if len(matching_roles) == 0:
        #             self.stdout.write(self.style.WARNING('User {} not mapped to government role in Keycloak. Will map.'
        #                                                  .format(user.username)))
        #             try:
        #                 map_user_into_role(get_token(), user.username, 'government')
        #             except UserNotFoundError:
        #                 self.stdout.write(self.style.WARNING(
        #                     'User {user} is not present in Keycloak. Not mapping.'
        #                         .format(user=user.username))
        #                 )
        #
        #     users = UserProfile.objects.filter(organization__is_government=False)
        #     for user in users:
        #         self.stdout.write(self.style.SUCCESS('Checking vehicle supplier user: {}'.format(user.username)))
        #         keycloak_roles_for_user = list_roles_for_username(get_token(), user.username)
        #         matching_roles = list(filter(lambda r: r['name'] == 'vehicle_supplier', keycloak_roles_for_user))
        #         if len(matching_roles) == 0:
        #             self.stdout.write(self.style.WARNING('User {} not mapped to vehicle_supplier role in Keycloak.'
        #                                                  ' Will map.'
        #                                                  .format(user.username)))
        #             try:
        #                 map_user_into_role(get_token(), user.username, 'vehicle_supplier')
        #             except UserNotFoundError:
        #                 self.stdout.write(self.style.WARNING(
        #                     'User {user} is not present in Keycloak. Not mapping.'
        #                         .format(user=user.username))
        #                )
        self.stdout.write(self.style.SUCCESS('Sync complete'))

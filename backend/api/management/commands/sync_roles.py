from collections import namedtuple

from django.core.management import BaseCommand

from api.services.keycloak_api import get_token, list_roles, create_role, \
    update_role_description, get_group_id, GroupNotFoundError, create_group, \
    list_groups, get_group_details, map_group_into_role, delete_role, delete_group_by_id

Authority = namedtuple('Authority', ('root', 'group', 'role', 'description'))

REQUIRED_AUTHORITIES = [
    Authority(None, 'IDIR', 'Government', 'Can see government-specific resources'),
    Authority(None, 'BCeID', 'Vehicle Supplier', 'Can see vehicle-supplier-specific resources'),
    Authority('IDIR', 'Administrator', 'View Dashboard', 'can view dashboard tasks and reports filtered by user role'),
    Authority('IDIR', 'Administrator', 'View Roles and Permissions', 'can view roles and permissions information'),
    Authority('IDIR', 'Administrator', 'View Organizations', 'can view organization information'),
    Authority('IDIR', 'Administrator', 'Create Organizations', 'can create new organizations'),
    Authority('IDIR', 'Administrator', 'Edit Organizations', 'can edit organization information'),
    Authority('IDIR', 'Administrator', 'Delete Organizations', 'can hide/disable organizations'),
    Authority('IDIR', 'Administrator', 'View Users', 'can view user information'),
    Authority('IDIR', 'Administrator', 'Create Users', 'can create new users'),
    Authority('IDIR', 'Administrator', 'Edit Users', 'can edit user information'),
    Authority('IDIR', 'Administrator', 'Delete Users', 'can hide/disable users'),
    Authority('IDIR', 'Administrator', 'Assign IDIR Roles', 'can assign roles to government (IDIR) users'),
    Authority('IDIR', 'Administrator', 'Assign BCeID Roles', 'can assign roles to external (BCeID) users'),
    Authority('IDIR', 'Director', 'View Dashboard', 'can view dashboard tasks and reports filtered by user role'),
    Authority('IDIR', 'Director', 'View Organizations', 'can view organization information'),
    Authority('IDIR', 'Director', 'View Users', 'can view user information'),
    Authority('IDIR', 'Director', 'View ZEV', 'can view ZEV model information'),
    Authority('IDIR', 'Director', 'View Sales', 'can view sales submissions for early credits'),
    Authority('IDIR', 'Director', 'Sign Sales', 'can approve and sign a sales submission for early credits'),
    Authority('IDIR', 'Director', 'Decline Sales', 'can decline to approve a sales submission for early credits'),
    Authority('IDIR', 'Director', 'View Credit Transfers', 'can view credit transfers'),
    Authority('IDIR', 'Director', 'Sign Credit Transfers', 'can approve and sign a credit transfers'),
    Authority('IDIR', 'Director', 'Decline Credit Transfers', 'can decline to approve a credit transfers'),
    Authority('IDIR', 'Director', 'View Compliance Reports', 'can view compliance reports'),
    Authority('IDIR', 'Director', 'Sign Compliance Report', 'can accept and sign a compliance report'),
    Authority('IDIR', 'Director', 'Reject Compliance Report', 'can reject a compliance report'),
    Authority('IDIR', 'Director', 'View Initiative Agreements', 'can view initiative agreements'),
    Authority('IDIR', 'Director', 'Sign Initiative Agreements', 'can approve and sign an initiative agreements'),
    Authority('IDIR', 'Director', 'Decline Initiative Agreements', 'can decline to approve an initiative agreements'),
    Authority('IDIR', 'Director', 'View Purchase Requests', 'can view credit purchase requests'),
    Authority('IDIR', 'Director', 'Sign Purchase Requests', 'can approve and sign a purchase requests'),
    Authority('IDIR', 'Director', 'Decline Purchase Requests', 'can decline to approve a purchase requests'),
    Authority('IDIR', 'Director', 'View File Submissions', 'can view and download files that have been uploaded'),
    Authority('IDIR', 'Engineer/Analyst', 'View Dashboard',
              'can view dashboard tasks and reports filtered by user role'),
    Authority('IDIR', 'Engineer/Analyst', 'View ZEV', 'can view ZEV model information'),
    Authority('IDIR', 'Engineer/Analyst', 'Create ZEV', 'can create new ZEV models'),
    Authority('IDIR', 'Engineer/Analyst', 'Edit ZEV', 'can edit ZEV model information'),
    Authority('IDIR', 'Engineer/Analyst', 'Delete ZEV', 'can hide/disable ZEV models'),
    Authority('IDIR', 'Engineer/Analyst', 'Validate ZEV', 'can validate/unvalidate ZEV models'),
    Authority('IDIR', 'Engineer/Analyst', 'View Sales', 'can view sales submissions for early credits'),
    Authority('IDIR', 'Engineer/Analyst', 'Create Sales', 'can create a new sales submission for early credits'),
    Authority('IDIR', 'Engineer/Analyst', 'Edit Sales', 'can edit sales submission for early credits'),
    Authority('IDIR', 'Engineer/Analyst', 'Delete Sales', 'can hide/disable sales submission for early credits'),
    Authority('IDIR', 'Engineer/Analyst', 'Recommend Sales',
              'can recommend approval or rejection of a sales submission for early credits'),
    Authority('IDIR', 'Engineer/Analyst', 'View Credit Transfers', 'can view credit transfer proposals'),
    Authority('IDIR', 'Engineer/Analyst', 'Create Credit Transfer', 'can create a new credit transfer proposal'),
    Authority('IDIR', 'Engineer/Analyst', 'Edit Credit Transfers', 'can edit credit transfer proposals'),
    Authority('IDIR', 'Engineer/Analyst', 'Delete Credit Transfers', 'can hide/disable credit transfer proposals'),
    Authority('IDIR', 'Engineer/Analyst', 'Recommend Credit Transfer',
              'can recommend approval or rejection of a credit transfer proposal'),
    Authority('IDIR', 'Engineer/Analyst', 'View Compliance Reports', 'can view compliance reports'),
    Authority('IDIR', 'Engineer/Analyst', 'Create Compliance Reports', 'can create a new compliance report'),
    Authority('IDIR', 'Engineer/Analyst', 'Edit Compliance Reports', 'can edit compliance reports'),
    Authority('IDIR', 'Engineer/Analyst', 'Delete Compliance Reports', 'can hide/disable compliance reports'),
    Authority('IDIR', 'Engineer/Analyst', 'Recommend Compliance Report',
              'can recommend acceptance or rejection of a compliance report'),
    Authority('IDIR', 'Engineer/Analyst', 'View Initiative Agreements', 'can view initiative agreements'),
    Authority('IDIR', 'Engineer/Analyst', 'Create Initiative Agreements', 'can create a new initiative agreement'),
    Authority('IDIR', 'Engineer/Analyst', 'Edit Initiative Agreements', 'can edit initiative agreements'),
    Authority('IDIR', 'Engineer/Analyst', 'Delete Initiative Agreements', 'can hide/disable initiative agreements'),
    Authority('IDIR', 'Engineer/Analyst', 'Recommend Initiative Agreements',
              'can recommend approval or rejection of an initiative agreements'),
    Authority('IDIR', 'Engineer/Analyst', 'View Purchase Requests', 'can view credit purchase requests'),
    Authority('IDIR', 'Engineer/Analyst', 'Create Purchase Requests', 'can create a new purchase request'),
    Authority('IDIR', 'Engineer/Analyst', 'Edit Purchase Requests', 'can edit purchase requests'),
    Authority('IDIR', 'Engineer/Analyst', 'Delete Purchase Requests', 'can hide/disable purchase requests'),
    Authority('IDIR', 'Engineer/Analyst', 'Recommend Purchase Requests',
              'can recommend approval or rejection of a purchase requests'),
    Authority('IDIR', 'Engineer/Analyst', 'View File Submissions',
              'can view and download files that have been uploaded'),
    Authority('BCeID', 'Organization Administrator', 'View Dashboard',
              'can view dashboard tasks and reports filtered by user role'),
    Authority('BCeID', 'Organization Administrator', 'View Roles and Permissions',
              'can view roles and permissions information'),
    Authority('BCeID', 'Organization Administrator', 'View Organization Information',
              'can view organization information'),
    Authority('BCeID', 'Organization Administrator', 'Edit Organization Information',
              'can edit organization information'),
    Authority('BCeID', 'Organization Administrator', 'View Users', 'can view user information'),
    Authority('BCeID', 'Organization Administrator', 'Create Users', 'can create new users'),
    Authority('BCeID', 'Organization Administrator', 'Edit Users', 'can edit user information'),
    Authority('BCeID', 'Organization Administrator', 'Delete Users', 'can delete/disable users'),
    Authority('BCeID', 'Organization Administrator', 'Assign BCeID Roles',
              'can assign roles to external (BCeID) users'),
    Authority('BCeID', 'Signing Authority', 'View Dashboard',
              'can view dashboard tasks and reports filtered by user role'),
    Authority('BCeID', 'Signing Authority', 'View Organization Information', 'can view organization information'),
    Authority('BCeID', 'Signing Authority', 'Submit ZEV', 'can submit new ZEV models to be validated by government'),
    Authority('BCeID', 'Signing Authority', 'Submit Sales', 'can submit a sales submission for early credits'),
    Authority('BCeID', 'Signing Authority', 'Submit Credit Transfer Proposal',
              'can sign and submit a credit transfer proposal for government approval'),
    Authority('BCeID', 'Signing Authority', 'Submit Compliance Report',
              'can sign and submit a compliance report for government acceptance'),
    Authority('BCeID', 'Signing Authority', 'Submit Initiative Agreements',
              'can sign and submit an initiative agreement for government approval'),
    Authority('BCeID', 'Signing Authority', 'Submit Purchase Requests',
              'can sign and submit a purchase requests for government approval'),
    Authority('BCeID', 'Manage ZEV', 'View Dashboard', 'can view dashboard tasks and reports filtered by user role'),
    Authority('BCeID', 'Manage ZEV', 'View Organization Information', 'can view organization information'),
    Authority('BCeID', 'Manage ZEV', 'View ZEV', 'can view ZEV model information'),
    Authority('BCeID', 'Manage ZEV', 'Create ZEV', 'can create new ZEV models'),
    Authority('BCeID', 'Manage ZEV', 'Edit ZEV', 'can edit ZEV model information'),
    Authority('BCeID', 'Manage ZEV', 'Delete ZEV', 'can hide/disable ZEV models'),
]


class Command(BaseCommand):
    help = 'Synchronize roles with keycloak'

    def add_arguments(self, parser):
        parser.add_argument('--dryrun', action='store_true', help='only show what would be done')

        parser.add_argument('--delete-roles', action='store_true',
                            help='delete roles that are not in the mapping list (DANGER)')
        parser.add_argument('--delete-groups', action='store_true',
                            help='delete groups that are not in the mapping list (DANGER)')

        helptext = ('Synchronize Keycloak roles with application roles',)

        parser.description = helptext

    def handle(self, *args, **options):
        dry_run = 'dryrun' in options and options['dryrun'] is True
        delete_roles = 'delete_roles' in options and options['delete_roles'] is True
        delete_groups = 'delete_groups' in options and options['delete_groups'] is True

        if dry_run:
            self.stdout.write(self.style.SUCCESS('Dry run'))

        self.stdout.write(self.style.SUCCESS('connected to keycloak successfully'))

        distinct_roles = {}
        distinct_groups = {}
        distinct_roots = {}

        for auth in REQUIRED_AUTHORITIES:
            if auth.root is not None:
                if auth.root not in distinct_roots:
                    distinct_roots[auth.root] = {
                        'name': auth.root,
                        'groups': [auth.group]
                    }
                else:
                    distinct_roots[auth.root]['groups'].append(auth.group)

            if auth.role not in distinct_roles:
                distinct_roles[auth.role] = {
                    'name': auth.role,
                    'description': auth.description
                }

            if auth.group not in distinct_groups:
                distinct_groups[auth.group] = {
                    'name': auth.group,
                    'parent': auth.root,
                    'roles': [auth.role]
                }
            else:
                distinct_groups[auth.group]['roles'].append(auth.role)

        self.stdout.write(self.style.SUCCESS('mapping distinct roles: {}'.format(distinct_roles.values())))
        self.stdout.write(self.style.SUCCESS('mapping distinct groups: {}'.format(distinct_groups.values())))
        self.stdout.write(self.style.SUCCESS('mapping distinct roots: {}'.format(distinct_roots.values())))

        unmatched_local = []
        roles_keycloak_has = list_roles(get_token())
        for role in roles_keycloak_has:
            self.stdout.write(self.style.SUCCESS('Keycloak already has role: {}'.format(role['name'])))
            matching_local_roles = list(filter(lambda r: r['name'] == role['name'], distinct_roles.values()))
            if len(matching_local_roles) == 0:
                unmatched_local.append(role['name'])
                self.stdout.write(self.style.WARNING('We have no local role called {}'.format(role['name'])))

        self.stdout.write(self.style.ERROR(unmatched_local))

        if len(unmatched_local) > 0:
            if delete_roles and not dry_run:
                for role in unmatched_local:
                    self.stdout.write(self.style.WARNING('deleting role {role} from keycloak'.format(role=role)))
                    delete_role(get_token(), role)
            else:
                self.stdout.write(self.style.WARNING('{count} unmatched roles. Not going to touch'
                                                     ' them. You may need to manually remove them from Keycloak'
                                                     .format(count=len(unmatched_local))))

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
        self.stdout.write(self.style.SUCCESS('keycloak existing groups:'))
        self.stdout.write(self.style.SUCCESS(groups))

        for root in distinct_roots.values():
            try:
                existing_group = get_group_id(get_token(), root['name'])
                details = get_group_details(get_token(), existing_group)
                self.stdout.write(self.style.SUCCESS(details))
            except GroupNotFoundError:
                self.stdout.write(
                    self.style.WARNING(('root group {} does not exist in Keycloak. Will create.'.format(root['name']))))
                if not dry_run:
                    create_group(get_token(), root['name'])

        for group in distinct_groups.values():
            already_mapped_roles = []
            try:
                existing_group = get_group_id(get_token(), group['name'])
                details = get_group_details(get_token(), existing_group)
                already_mapped_roles = details['roles']
                self.stdout.write(self.style.SUCCESS(details))
            except GroupNotFoundError:
                self.stdout.write(
                    self.style.WARNING(('group {} does not exist in Keycloak. Will create.'.format(group['name']))))
                if not dry_run:
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
                    if not dry_run:
                        map_group_into_role(get_token(), group['name'], role)

        groups_keycloak_has = list_groups(get_token())

        for group in groups_keycloak_has:
            if group['name'] not in distinct_roots.keys() and group['name'] not in distinct_groups.keys():
                self.stdout.write(
                    self.style.WARNING('keycloak has extraneous group {group}'.format(group=group['name']))
                )
                if delete_groups and not dry_run:
                    self.stdout.write(
                        self.style.WARNING('issuing delete for group {group}'.format(group=group['name']))
                    )
                    delete_group_by_id(get_token(), group['id'])

        self.stdout.write(self.style.SUCCESS('Sync complete'))

import logging

import jwt
import requests
from django.conf import settings
from django.core.cache import caches
from django.utils.datetime_safe import datetime, time

logger = logging.getLogger('zeva.keycloak')

# hide these ones from the client response (they're in the token anyway, but there's no need to display them in the UI)
FILTERED_ROLES = ['offline_access', 'uma_authorization']

cache = caches['keycloak']
slack_time = 30


class UserNotFoundError(Exception):
    pass


class GroupNotFoundError(Exception):
    pass


def get_token():
    """
    This function will generate the token for the Service Account.
    This token is most likely going to be used to update information
    for the logged-in user (not to be confused with the service account)
    such as auto-mapping the user upon first login.
    """
    cached_token = cache.get('sa-token')
    cached_token_expiry = cache.get('sa-token-expiry')
    if cached_token and cached_token_expiry and cached_token_expiry > datetime.utcnow():
        logger.info('returning cached token (within expiry)')
        return cached_token

    token_url = '{keycloak}/auth/realms/{realm}/protocol/openid-connect/token'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'])

    response = requests.post(
        token_url,
        auth=(
            settings.KEYCLOAK['SERVICE_ACCOUNT_CLIENT_ID'],
            settings.KEYCLOAK['SERVICE_ACCOUNT_CLIENT_SECRET']
        ),
        data={'grant_type': 'client_credentials'}
    )

    token = response.json()['access_token']
    token_dict = jwt.decode(
        token,
        verify=False
    )

    expiry_time = datetime.utcfromtimestamp(token_dict['exp'])
    now = datetime.utcnow()
    ttl = expiry_time - now

    cache.set('sa-token', token, int(ttl.total_seconds() - slack_time))
    cache.set('sa-token-expiry', expiry_time, int(ttl.total_seconds() - slack_time))

    logger.info('our token is good for {} seconds'.format(int(ttl.total_seconds() - slack_time)))

    return token


def list_users(token):
    """
    Retrieves the list of users found in Keycloak.
    Not to be confused with the list of users found in the actual
    database.
    """
    users_url = '{keycloak}/auth/admin/realms/{realm}/users'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'])

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.get(users_url,
                            headers=headers)

    all_users = response.json()
    for user in all_users:
        users_detail_url = '{keycloak}/auth/admin/realms/{realm}/users/{user_id}/federated-identity'.format(
            keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
            realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
            user_id=user['id'])

        response = requests.get(users_detail_url,
                                headers=headers)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))


def associate_federated_identity_with_user(token, id, provider, username):
    users_url = '{keycloak}/auth/admin/realms/{realm}/users/{user_id}/federated-identity/{provider}'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        user_id=id,
        provider=provider)

    headers = {'Authorization': 'Bearer {}'.format(token)}

    data = {
        'userName': username
    }

    _response = requests.post(
        users_url,
        headers=headers,
        json=data
    )


def map_user(keycloak_user_id, zeva_user_id):
    """
    Maps the logged-in user to their keycloak account.
    Please note that the get_token doesn't refer to the logged-in user's
    account.
    get_token retrieves the token for the service account that's going to
    update the user information in keycloak.
    """
    users_url = '{keycloak}/auth/admin/realms/{realm}/users/{user_id}'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        user_id=keycloak_user_id)

    headers = {'Authorization': 'Bearer {}'.format(get_token())}

    data = {
        'attributes': {
            'user_id': zeva_user_id
        }
    }

    response = requests.put(
        users_url,
        headers=headers,
        json=data
    )

    if not response.ok:
        raise RuntimeError('bad response code: {}'.format(response.status_code))


def create_user(token, user_name, maps_to_id):
    """
    Creates the user account in Keycloak
    """
    users_url = '{keycloak}/auth/admin/realms/{realm}/users'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'])

    headers = {'Authorization': 'Bearer {}'.format(token)}

    data = {
        'enabled': True,
        'username': user_name,
        'attributes': {
            'user_id': maps_to_id
        }
    }

    response = requests.post(
        users_url,
        headers=headers,
        json=data
    )

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))

    created_user_response = requests.get(
        response.headers['Location'],
        headers=headers
    )

    return created_user_response.json()['id']


def get_role_id(token, rolename):
    cached_role_id = cache.get('role.id.by_rolename.{}'.format(rolename))

    if cached_role_id:
        logger.info('returning cached role id')
        return cached_role_id

    url = '{keycloak}/auth/admin/realms/{realm}/roles/{role}'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        role=rolename)

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.get(url,
                            headers=headers)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))

    role = response.json()

    cache.set('role.id.by_rolename.{}'.format(rolename), role['id'], 3600)

    return role['id']


def get_user_id(token, username):
    cached_user_id = cache.get('user.id.by_username.{}'.format(username))

    if cached_user_id:
        logger.info('returning cached user id')
        return cached_user_id

    url = '{keycloak}/auth/admin/realms/{realm}/users?search={username}'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        username=username)

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.get(url,
                            headers=headers)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))

    all_users = response.json()

    logger.info(all_users)

    id = None

    for user in all_users:
        if username in user['attributes']['user_id']:
            id = user['id']
            break

    if id is None:
        logger.warning('User not found in Keycloak')
        return None

    cache.set('user.id.by_username.{}'.format(username), id, 3600)

    return id


def get_group_id(token, groupname):
    cached_group_id = cache.get('group.id.by_groupname.{}'.format(groupname))

    if cached_group_id:
        logger.info('returning cached group id')
        return cached_group_id

    url = '{keycloak}/auth/admin/realms/{realm}/groups'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'])

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.get(url,
                            headers=headers)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))

    all_groups = response.json()

    logger.warning(all_groups)

    search = all_groups

    for group in search:
        if group['name'] == groupname:
            cache.set('group.id.by_groupname.{}'.format(groupname), group['id'], 3600)
            return group['id']

        search.extend(group['subGroups'])

    raise GroupNotFoundError()


def list_groups_for_username(token, username):
    """
    Retrieves the list of groups found in Keycloak for a user.
    """

    id = get_user_id(token, username)

    if id is None:
        return []

    url = '{keycloak}/auth/admin/realms/{realm}/users/{id}/groups'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        id=id)

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.get(url,
                            headers=headers)
    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))

    user_details = response.json()

    return [g['name'] for g in user_details]


def list_roles(token):
    """
    Retrieves the list of all roles found in Keycloak.
    """
    url = '{keycloak}/auth/admin/realms/{realm}/roles'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'])

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.get(url,
                            headers=headers)

    all_roles = response.json()

    logger.info(all_roles)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))

    filtered_roles = filter(lambda r: 'name' in r and r['name'] not in FILTERED_ROLES, all_roles)

    return [
        {
            'name': r['name'],
            'id': r['id'],
            'description': r['description']
        } for r in filtered_roles
    ]


def list_groups(token):
    """
    Retrieves the list of all groups found in Keycloak.
    """
    cached_group_list = cache.get('group_list')
    if cached_group_list:
        return cached_group_list

    url = '{keycloak}/auth/admin/realms/{realm}/groups'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'])

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.get(url,
                            headers=headers)

    all_groups = response.json()

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))

    result = [
        {
            'name': g['name'],
            'id': g['id'],
            'roles': get_group_details(token, g['id'])['roles'],
            'subGroups': [
                {
                    'name': sg['name'],
                    'roles': get_group_details(token, sg['id'])['roles'],
                    'id': sg['id'],
                } for sg in g['subGroups']
            ]
        } for g in all_groups
    ]
    for r in result:
        logger.info(r)

    cache.set('group_list', result, 3600)

    return result


def get_group_details(token, group_id):
    """
    Retrieves the group details found in Keycloak.
    """
    url = '{keycloak}/auth/admin/realms/{realm}/groups/{group_id}'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        group_id=group_id)

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.get(url,
                            headers=headers)

    group = response.json()
    logger.warning(group)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))

    role_details = list_roles(token)

    return {
        'name': group['name'],
        'id': group['id'],
        'roles': list(filter(lambda r: r['name'] in group['realmRoles'], role_details))
    }


def create_role(token, name, description):
    """
    Create a Keycloak role.
    """
    url = '{keycloak}/auth/admin/realms/{realm}/roles'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'])

    headers = {'Authorization': 'Bearer {}'.format(token)}

    payload = {
        'name': name,
        'description': description
    }

    logger.info(payload)

    response = requests.post(url, json=payload, headers=headers)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))


def update_role_description(token, name, description):
    """
    Update a Keycloak role description.
    """
    url = '{keycloak}/auth/admin/realms/{realm}/roles/{name}'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        name=name)

    logger.info('url: {}'.format(url))

    headers = {'Authorization': 'Bearer {}'.format(token)}

    payload = {
        'description': description
    }

    response = requests.put(url, json=payload, headers=headers)

    if not response.ok:
        logger.warning(response.content)
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))


def create_group(token, name, parent=None):
    """
    Create a Keycloak group.
    """
    if parent is None:
        url = '{keycloak}/auth/admin/realms/{realm}/groups'.format(
            keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
            realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'])
    else:
        url = '{keycloak}/auth/admin/realms/{realm}/groups/{parent_id}/children'.format(
            keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
            realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
            parent_id=get_group_id(token, parent)
        )

    headers = {'Authorization': 'Bearer {}'.format(token)}

    payload = {
        'name': name,
    }

    logger.info(payload)

    response = requests.post(url, json=payload, headers=headers)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))


def map_group_into_role(token, groupname, role):
    """
    Map a Keycloak group into a role
    """
    id = get_group_id(token, groupname)

    if id is None:
        raise GroupNotFoundError('Group id for group {groupname} not found in Keycloak'
                                 .format(groupname=groupname))

    url = '{keycloak}/auth/admin/realms/{realm}/groups/{id}/role-mappings/realm'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        id=id
    )

    headers = {'Authorization': 'Bearer {}'.format(token)}

    payload = [
        {
            'id': get_role_id(token, role),
            'name': role
        }
    ]

    response = requests.post(url, json=payload, headers=headers)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))


def delete_role(token, name):
    """
    Remove a Keycloak role.
    """
    url = '{keycloak}/auth/admin/realms/{realm}/roles/{name}'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        name=name
    )

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.delete(url, headers=headers)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))


def delete_group_by_id(token, id):
    """
    Remove a Keycloak group.
    """
    url = '{keycloak}/auth/admin/realms/{realm}/groups/{id}'.format(
        keycloak=settings.KEYCLOAK['SERVICE_ACCOUNT_KEYCLOAK_API_BASE'],
        realm=settings.KEYCLOAK['SERVICE_ACCOUNT_REALM'],
        id=id
    )

    headers = {'Authorization': 'Bearer {}'.format(token)}

    response = requests.delete(url, headers=headers)

    if not response.ok:
        raise RuntimeError(
            'bad response code: {}'.format(response.status_code))

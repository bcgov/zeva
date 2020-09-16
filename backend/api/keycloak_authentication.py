import json
import jwt
from jwt import InvalidTokenError
from jwt.algorithms import RSAAlgorithm
import requests

from cryptography.hazmat.primitives import serialization
from django.core.cache import caches
from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions

from api.models.user_profile import UserProfile
from api.models.user_creation_request import UserCreationRequest
from api.services.keycloak_api import map_user

cache = caches['keycloak']
FILTERED_ROLES = ['uma_authorization', 'offline_access']


class UserAuthentication(authentication.BaseAuthentication):
    """
    Class to handle authentication when after logging into keycloak
    """
    def _get_keys(self):
        """
        Assemble a list of valid signing public keys we use to verify the token
        """

        decoded_keys = {}

        # We have a test key loaded
        if settings.KEYCLOAK['RS256_KEY'] is not None:
            decoded_keys['imported'] = settings.KEYCLOAK['RS256_KEY']

        if not settings.KEYCLOAK['DOWNLOAD_CERTS']:
            return decoded_keys

        keys = cache.get('verification_keys')

        if keys is None:
            # Cache miss. Download a key directly from Keycloak
            response = requests.get(settings.KEYCLOAK['CERTS_URL'], timeout=5)

            if not response:
                raise RuntimeError('keys not available from {}'.format(
                    settings.KEYCLOAK['CERTS_URL']))

            keys = response.json()

            cache.set('verification_keys', keys, 600)

        decoded_keys = {}

        for key in keys['keys']:
            if key['alg'] in ['RS256', 'RS384', 'RS512']:
                decoded_keys[key['kid']] = RSAAlgorithm.from_jwk(
                    json.dumps(key)
                ).public_bytes(
                    format=serialization.PublicFormat.SubjectPublicKeyInfo,
                    encoding=serialization.Encoding.PEM
                ).decode('utf-8')

        return decoded_keys

    def authenticate(self, request):
        """
        Verify the JWT token and find the correct user in the DB
        """
        if not settings.KEYCLOAK['ENABLED']:
            # fall through
            return None

        auth = request.META.get('HTTP_AUTHORIZATION', None)

        if not auth:
            raise exceptions.AuthenticationFailed(
                'Authorization header required')

        try:
            scheme, token = auth.split()
        except ValueError:
            raise exceptions.AuthenticationFailed(
                'Invalid format for authorization header')

        if scheme != 'Bearer':
            raise exceptions.AuthenticationFailed(
                'Authorization header invalid'
            )

        if not token:
            raise exceptions.AuthenticationFailed(
                'No token found'
            )

        user_token = None
        token_validation_errors = []

        keys = self._get_keys().items()

        if len(keys) == 0:
            raise exceptions.AuthenticationFailed(
                'no keys available for verification')

        for _kid, key in keys:
            try:
                user_token = jwt.decode(
                    token,
                    key=str(key),
                    audience=settings.KEYCLOAK['AUDIENCE'],
                    issuer=settings.KEYCLOAK['ISSUER']
                )
                break
            except InvalidTokenError as error:
                token_validation_errors.append(error)

        if not user_token:
            raise exceptions.AuthenticationFailed(
                'No successful decode of user token. Exceptions occurred: {}',
                '\n'.join([str(error) for error in token_validation_errors])
            )

        user = None

        if 'user_id' not in user_token:
            # try email
            if 'email' in user_token:
                user_profile = UserProfile.objects.filter(
                    keycloak_email__iexact=user_token['email']
                )

                if not user_profile.exists():
                    raise exceptions.AuthenticationFailed(
                        "User does not exist.")

                if user_profile.count() > 1:
                    preferred_username, _ = user_token[
                        'preferred_username'].split('@')

                    user_profile = user_profile.filter(
                        username__iexact=preferred_username
                    )

                user = user_profile.first()

                map_user(
                    user_token.get('sub'),
                    user.username
                )
            else:
                raise exceptions.AuthenticationFailed(
                    'user_id or email is required in jwt payload')
        else:
            try:
                user = UserProfile.objects.get_by_natural_key(
                    user_token.get('user_id')
                )
            except UserProfile.DoesNotExist:
                raise exceptions.AuthenticationFailed(
                    'user_id "{}" does not exist'.format(
                        user_token.get('user_id')
                    ))

        if not user.is_active:
            raise exceptions.PermissionDenied(
                'Your account is currently inactive. Please contact your '
                'administrator to re-activate your account.'
            )

        return user, None

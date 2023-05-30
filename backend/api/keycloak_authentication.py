import json
import jwt
import requests

from django.core.cache import caches
from django.conf import settings
from django.db.models import Q
from rest_framework import authentication
from rest_framework import exceptions

from api.models.user_profile import UserProfile
from zeva.settings import WELL_KNOWN_ENDPOINT

cache = caches['keycloak']
FILTERED_ROLES = ['uma_authorization', 'offline_access']


class UserAuthentication(authentication.BaseAuthentication):
    """
    Class to handle authentication when after logging into keycloak
    """
    def refresh_jwk(self):
        print('*** refreshing_jwk')
        oidc_response = requests.get(WELL_KNOWN_ENDPOINT)
        print('*** oidc_response', oidc_response)
        jwks_uri = json.loads(oidc_response.text)['jwks_uri']
        print('*** jwks_uri', jwks_uri)
        self.jwks_uri = jwks_uri
        certs_response = requests.get(jwks_uri)
        jwks = json.loads(certs_response.text)
        print('*** jwks', jwks)
        self.jwks = jwks

    def __init__(self):
        self.refresh_jwk()

    def authenticate(self, request):
        """
        Verify the JWT token and find the correct user in the DB
        """
        print('*** authenticate start')

        if not settings.KEYCLOAK['ENABLED']:
            # fall through
            return None

        auth = request.META.get('HTTP_AUTHORIZATION', None)
        print('*** auth config', auth)

        if not auth:
            print('Authorization header required')
            raise exceptions.AuthenticationFailed(
                'Authorization header required')

        if settings.KEYCLOAK['TESTING_ENABLED']:
            try:
                user = UserProfile.objects.get(keycloak_user_id=auth['preferred_username'])
                return user, None
            except UserProfile.DoesNotExist as exc:
                # print("Testing User does not exist")
                raise UserProfile.DoesNotExist(str(exc))

        try:
            scheme, token = auth.split()
            print('*** scheme', scheme)
            print('*** token', token)
        except ValueError:
            print('Invalid format for authorization header')
            raise exceptions.AuthenticationFailed(
                'Invalid format for authorization header')

        if scheme != 'Bearer':
            print('Authorization header invalid')
            raise exceptions.AuthenticationFailed(
                'Authorization header invalid'
            )

        if not token:
            print('No token found')
            raise exceptions.AuthenticationFailed(
                'No token found'
            )
        
        print('*** auth checks passed')

        user_token = None
        token_validation_errors = []
        
        jwks_client = jwt.PyJWKClient(self.jwks_uri)

        print('*** jwks_client', jwks_client)

        try:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            print('*** signing_key', signing_key)
        except Exception as exc:
            print(exc)
            token_validation_errors.append(exc)
            raise Exception(str(exc))

        try:
            user_token = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=settings.KEYCLOAK['AUDIENCE'],
                options={"verify_exp": True},
            )
            print('*** user_token', user_token)

        except (jwt.InvalidTokenError, jwt.ExpiredSignatureError, jwt.DecodeError) as exc:
            print(str(exc))
            token_validation_errors.append(exc)
            raise Exception(str(exc))

        if not user_token:
            print('*** no user token')
            raise exceptions.AuthenticationFailed(
                'No successful decode of user token. Exceptions occurred: {}',
                '\n'.join([str(error) for error in token_validation_errors])
            )

        # Check for existing mapped user
        if 'preferred_username' in user_token:
            print('*** preferred_username', user_token['preferred_username'])
            try:
                user = UserProfile.objects.get(keycloak_user_id=user_token['preferred_username'])
                print('*** user', user)
                return user, None
            except Exception as exc:
                print(str(exc))
            except UserProfile.DoesNotExist: 
                print("User does not exist, falling through")
                pass

        try:
            # Which provider is user logging in with
            if user_token['identity_provider'] == 'idir':
                external_username = user_token['idir_username']
            elif user_token['identity_provider'] == 'bceidbusiness':
                external_username = user_token['bceid_username']
            else:
                raise Exception('unknown identity provider')
        except Exception as exc:
            raise Exception('identity provider invalid')

        print('*** external_username', external_username)

        # fall through to here if no mapped user is found
        if 'email' in user_token:
            print('*** user email', user_token['email'])
            # we map users by email and external_username
            user_profile = UserProfile.objects.filter(
                keycloak_email__iexact=user_token['email']
            ).filter(
              username__iexact=external_username
            )

            # Ensure that idir users can only be mapped to bcgov org
            # and external users are mapped only to supplier orgs
            if user_token['identity_provider'] == 'idir':
                user_profile.filter(organization=1)
            elif user_token['identity_provider'] == 'bceidbusiness':
                user_profile.filter(~Q(organization=1))
            else:
                print('*** unknown identity provider')
                raise Exception('unknown identity provider')

            # filter out if the user has already been mapped
            user = user_profile.filter(keycloak_user_id=None).first()
            print('*** user', user)

            if not user:
                print("No User with that configuration exists.")
                raise exceptions.AuthenticationFailed(
                    "No User with that configuration exists.")

            # map keycloak user to tfrs user
            user.keycloak_user_id = user_token['preferred_username']
            user.save()
        else:
            print('*** preffered_username or email is required in jwt payload')
            raise exceptions.AuthenticationFailed(
                'preffered_username or email is required in jwt payload')
        
        try:
            user = UserProfile.objects.get(keycloak_user_id=user_token['preferred_username'])
            if not user.is_active:
                print('*** User is not active')
                raise exceptions.AuthenticationFailed('User is not active')
        except UserProfile.DoesNotExist:
            print('*** User does not exist')
            raise exceptions.AuthenticationFailed('User does not exist')

        if not user.is_active:
            print('*** User is inactive')
            raise exceptions.PermissionDenied(
                'Your account is currently inactive. Please contact your '
                'administrator to re-activate your account.'
            )

        print('*** end user', user)

        return user, None

import jwt
import requests
import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from configuration.db import DB, get_session
from configuration.keycloak import KEYCLOAK
from jwt import InvalidTokenError

from jwt.algorithms import RSAAlgorithm
from cryptography.hazmat.primitives import serialization

import logging

from models.user import User


class AuthenticationFailed(Exception):
    pass


class JWTAuthenticator:

    @staticmethod
    def _get_keys():
        """
        Assemble a list of valid signing public keys we use to verify the token
        """

        decoded_keys = {}

        # We have a test key loaded
        if KEYCLOAK['RS256_KEY'] is not None:
            decoded_keys['imported'] = KEYCLOAK['RS256_KEY']

        if not KEYCLOAK['DOWNLOAD_CERTS']:
            return decoded_keys

        response = requests.get(KEYCLOAK['CERTS_URL'], timeout=5)

        if not response:
            raise RuntimeError('keys not available from {}'.format(
                KEYCLOAK['CERTS_URL']))

        keys = response.json()

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

    @staticmethod
    def validate_token_and_load_user(token):

        if token is None:
            logging.error('no authorization token passed')
            raise AuthenticationFailed

        logging.info('decoding key: {}'.format(token))

        user_token = None

        keys = JWTAuthenticator._get_keys().items()

        if len(keys) == 0:
            logging.error('No keys available for JWT decode')
            raise AuthenticationFailed

        for _kid, key in keys:
            try:
                user_token = jwt.decode(token,
                                        key=str(key),
                                        audience=KEYCLOAK['AUDIENCE'],
                                        issuer=KEYCLOAK['ISSUER'])
                logging.info('successful decode of token: {}'.format(user_token))
                break
            except InvalidTokenError as error:
                logging.error('Error during decode:', error)
                raise AuthenticationFailed

        if not user_token:
            raise AuthenticationFailed

        session = get_session()

        db_user = session.query(User).filter(User.username == user_token['user_id']).first()
        if db_user is None:
            raise AuthenticationFailed

        return db_user

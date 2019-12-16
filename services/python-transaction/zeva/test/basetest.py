import logging
import unittest

import jwt
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from configuration.keycloak import KEYCLOAK


class BaseTest(unittest.TestCase):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.TEST_PORT = '127.0.0.1:11235'

    @classmethod
    def setUpClass(cls):
        logging.debug('base class setup')

    @classmethod
    def tearDownClass(cls):
        logging.debug('base class teardown')

    def setUp(self):
        super().setUp()

        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )

        # override the jwt verification keys for testing

        KEYCLOAK['ENABLED'] = True
        KEYCLOAK['DOWNLOAD_CERTS'] = False
        KEYCLOAK['ISSUER'] = 'zeva-test'
        KEYCLOAK['AUDIENCE'] = 'zeva-app'
        KEYCLOAK['RS256_KEY'] = private_key.public_key().public_bytes(
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
            encoding=serialization.Encoding.PEM
        ).decode('utf-8')

        # the private half, used to sign our jwt (keycloak does this in actual use)

        self.private_key = private_key.private_bytes(
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
            encoding=serialization.Encoding.PEM
        ).decode('utf-8')

        _users = [
            {
                'username': 'test_vs_1',
                'email': 'user1@test.com'
            },
            {
                'username': 'test_vs_2',
                'email': 'user2@test.com'
            }
        ]

        self.users = dict(
            map(lambda user: (
                user['username'],
                {
                    'jwt': jwt.encode(
                        payload={
                            'user_id': str(user['username']),
                            'iss': 'zeva-test',
                            'aud': 'zeva-app',
                            'preferred_username': 'Test User {}'.format(user['username']),
                            'email': user['email']
                        }, key=self.private_key, algorithm='RS256').decode('utf-8')
                }
            ), _users)
        )

        with open("_test_cert.pem", "rb") as f:
            self.channel_certificate = f.read()

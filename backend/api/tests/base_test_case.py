# -*- coding: utf-8 -*-
# pylint: disable=no-member,invalid-name,duplicate-code
import contextlib
import io
import jwt
import logging
import sys

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from django.core.management import call_command
from django.test import TestCase

from api.models.user_profile import UserProfile
from api.tests.logging_client import LoggingClient

from zeva import settings


class BaseTestCase(TestCase):
    """
    Base Test class that we can use to setup the initial data
    """

    fixtures = []

    usernames = [
        'RTAN',
        'RTAN_BCEID',
        'EMHILLIE_BCEID',
        'KMENKE_BCEID'
    ]

    # For use in child classes
    extra_fixtures = None
    extra_usernames = None

    logger = logging.getLogger('zeva.test')

    @classmethod
    def setUpClass(cls):
        """Load any extra fixtures that child classes have declared"""
        if cls.extra_fixtures is not None:
            cls.fixtures = cls.fixtures + cls.extra_fixtures
        super().setUpClass()

    def __init__(self, *args, **kwargs):
        """
        Add any extra usernames that child classes have declared to our
        list of clients
        """

        if self.extra_usernames is not None:
            self.usernames = self.usernames + self.extra_usernames

        super().__init__(*args, **kwargs)

    def tearDown(self):
        super().tearDown()
        # self.patcher.stop()

    def setUp(self):
        """Configure test clients"""

        super().setUp()

        with contextlib.redirect_stdout(io.StringIO()):
            call_command(
                'load_ops_data',
                'api/fixtures/operational',
                '--directory', '--no-exit'
            )
            call_command(
                'load_ops_data',
                'api/fixtures/test',
                '--directory', '--no-exit'
            )

        # generate a new RSA key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )

        # override the jwt verification keys for testing
        settings.KEYCLOAK['ENABLED'] = True
        settings.KEYCLOAK['TESTING_ENABLED'] = True
        settings.KEYCLOAK['DOWNLOAD_CERTS'] = False
        settings.KEYCLOAK['ISSUER'] = 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard'
        settings.KEYCLOAK['AUDIENCE'] = 'zeva-on-gold-4543'
        settings.KEYCLOAK['RS256_KEY'] = private_key.public_key().public_bytes(
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
            encoding=serialization.Encoding.PEM
        ).decode('utf-8')

        # the private half, used to sign our jwt (keycloak does this in actual use)

        self.private_key = private_key.private_bytes(
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
            encoding=serialization.Encoding.PEM
        ).decode('utf-8')

        self.users = dict(map(
            lambda u: (u, UserProfile.objects.get_by_natural_key(u)),
            self.usernames
        ))

        self.clients = dict(
            map(lambda user: (
                user.username,
                LoggingClient(
                    HTTP_AUTHORIZATION={
                      'preferred_username': str(user.username)
                    }
                )), self.users.values()))

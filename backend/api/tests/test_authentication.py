# -*- coding: utf-8 -*-
# pylint: disable=no-member,invalid-name

from django.test import RequestFactory
from rest_framework import exceptions

from api.keycloak_authentication import UserAuthentication
import jwt
from .base_test_case import BaseTestCase
from api.models.user_profile import UserProfile


class TestAuthentication(BaseTestCase):
    """Tests for authentication module"""

    def setUp(self):
        """Prepare test resources"""
        self.factory = RequestFactory()
        self.userauth = UserAuthentication()
        super().setUp()

    def test_jwt_invalid_token(self):
        """Test invalid token"""

        request = self.factory.get('/')
        request.META = {
            'HTTP_AUTHORIZATION': {
                'preferred_username': 'garbage'
            }
        }

        with self.assertRaises(UserProfile.DoesNotExist):
            _user, _auth = self.userauth.authenticate(request)

    def test_jwt_no_token(self):
        """Test no token"""

        request = self.factory.get('/')

        with self.assertRaises(exceptions.AuthenticationFailed):
            _user, _auth = self.userauth.authenticate(request)

    def test_jwt_valid_token(self):
        request = self.factory.get('/')

        request.META = {
            'HTTP_AUTHORIZATION': {
                'preferred_username': 'RTAN'
            }
        }

        _user, _auth = self.userauth.authenticate(request)

from .base_test_case import BaseTestCase
import random
from ..models.user_profile import UserProfile
from django.urls import reverse
from rest_framework import status
from ..models.organization import Organization
from ..models.role import Role
class TestUsers(BaseTestCase):
    def setUp(self):
        super().setUp()
        organizations = Organization.objects.filter(
            is_government=False,
            is_active=True
        )
        self.user1  = self.users['RTAN_BCEID']
        self.org1 = self.users[self.user1.username].organization
        filtered_organizations = [org for org in organizations if org != self.org1]
        self.user2 = UserProfile.objects.create(
            username="testuser",
            organization=self.org1,
            first_name="user",
            last_name="two",
            display_name="test user 2",
            keycloak_email="user2@email.com"
        )
        other_org = random.choice(filtered_organizations)
        self.user3 = UserProfile.objects.create(
            username="otherorguser",
            organization=other_org,
            first_name="user",
            last_name="three",
            display_name="test user 3",
            keycloak_email="user3@email.com"
        )
        role_queryset = Role.objects.filter(is_government_role= 'False')
        self.roles = list(role_queryset.values_list('id', flat=True))

    """ assert that a user can get their own details"""
    def test_get_current_user(self):
        response = self.clients[self.user1.username].get("/api/users/current")
        self.assertEqual(response.status_code, 200)

    def test_get_details_other_user_in_org(self):
        """user can get details of users in their own org"""
        response = self.clients[self.user1.username].get("/api/users/{}".format(self.user2.id))
        self.assertEqual(response.status_code, 200)

    def test_get_details_other_users_other_org(self):
        """user cannot get details of users in other orgs"""
        response = self.clients[self.user1.username].get("/api/users/{}".format(self.user3.id))
        self.assertEqual(response.status_code, 404)
    
    def test_edit_self(self):
        """user can update their own profile"""
        response = self.clients[self.user1.username].put(
        "/api/users/{}".format(self.user1.id),
        {'first_name':"test change",
         'last_name': self.user1.last_name,
         'title': 'director',
         'username': self.user1.username,
         'keycloak_email': 'test@email.com',
         'roles': self.roles},
         content_type='application/json',
        )
        self.assertEquals(response.data['first_name'], 'test change')
        self.assertEqual(response.status_code, 200)

    def test_edit_user_in_same_org(self):
        """that user can update other users in their own org"""
        response = self.clients[self.user1.username].put(
            "/api/users/{}".format(self.user2.id),
            {'first_name':"test change",
            'last_name': self.user2.last_name,
            'title': 'director',
            'username': self.user2.username,
            'keycloak_email': self.user2.keycloak_email,
             'roles': self.roles}, content_type='application/json',)
        
        self.assertEquals(response.data['first_name'], 'test change')
        self.assertEqual(response.status_code, 200)

    def test_edit_user_in_other_org(self):
        """updating a user from another org should fail"""
        response = self.clients[self.user1.username].put(
            "/api/users/{}".format(self.user3.id),
            {'first_name':"test change",
            'last_name': self.user3.last_name,
            'title': 'director',
            'username': self.user3.username,
            'keycloak_email': self.user3.keycloak_email,
             'roles': self.roles
             }, content_type='application/json',)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['detail'], 'Not found.')
        # Ensure that 'first_name' is not in the response data (since it's a 404)
        self.assertNotIn('first_name', response.data)
        # get the user3 object and make sure the first name hasnt changed
        user3_updated = UserProfile.objects.get(id=self.user3.id)
        self.assertEquals(user3_updated.first_name, self.user3.first_name)
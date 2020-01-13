from .base_test_case import BaseTestCase


class TestOrganizations(BaseTestCase):

    def test_get_my_organization(self):
        response = self.clients['vs_user_1'].get("/api/organizations/mine")
        self.assertEqual(response.status_code, 200)

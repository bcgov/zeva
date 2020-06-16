from .base_test_case import BaseTestCase


class TestOrganizations(BaseTestCase):

    def test_get_my_organization(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/mine")
        self.assertEqual(response.status_code, 200)

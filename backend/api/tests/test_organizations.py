from .base_test_case import BaseTestCase
from api.models.organization import Organization
import json
from api.models.organization_ldv_sales import OrganizationLDVSales

class TestOrganizations(BaseTestCase):
    def setUp(self):
        super().setUp()
        organizations = Organization.objects.filter(
            is_government=False,
            is_active=True
        )
        self.user  = self.users['RTAN_BCEID']
        self.organization = Organization.objects.get(id=self.user.organization_id)
        filtered_organizations = [org for org in organizations if org != self.organization]
        self.other_organization = filtered_organizations[0]

    """
    BCEID USERS
    """

    """a bceid user can see the list of orgs with names but no balances"""
    def test_bceid_get_list_of_orgs(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations")
        data = response.json()[0]
        response_keys = list(data.keys())
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('balance', response_keys)

    """a user can see the details of their own organization """
    def test_bceid_get_my_organization_details(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/mine")
        data = response.json()
        response_keys = list(data.keys())
        balance = self.organization.balance
        self.assertEqual(response.status_code, 200)
        self.assertIn('balance', response_keys)
        self.assertIn('users', response_keys)
        self.assertIn('organizationAddress', response_keys)
        self.assertEqual(balance.get('A'), balance['A'])
        self.assertEqual(balance.get('B'), balance['B'])

    """a bceid user cannot see balance or sales of a different organization"""
    def test_bceid_get_other_organization_details(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}".format(self.other_organization.id))
        data = response.json()
        response_keys = list(data.keys())
        self.assertEqual(response.status_code, 404)
        self.assertNotIn('balance', response_keys)
        self.assertNotIn('users', response_keys)
        self.assertNotIn('organizationAddress', response_keys)
    
    """a bceid user cannot see the users of a different organization"""
    def test_bceid_get_other_organization_users(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/users".format(self.other_organization.id))
        data = response.json()
        response_keys = list(data.keys())
        self.assertEqual(response.status_code, 404)
        self.assertNotIn('users', response_keys)

    """a bceid user cannot see the sales of other orgs"""
    def test_bceid_get_sales(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/sales".format(self.other_organization.id))
        self.assertEqual(response.status_code, 403)

    """a bceid user cannot see the transactions of specific orgs"""
    def test_bceid_get_supplier_transactions(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/supplier_transactions".format(self.other_organization.id))
        self.assertEqual(response.status_code, 403) 

    """a bceid user cannot see the ldv sales of specific orgs"""
    def test_bceid_get_ldvsales(self):
        response = self.clients['RTAN_BCEID'].put("/api/organizations/{}/ldv_sales".format(self.other_organization.id))
        self.assertEqual(response.status_code, 403)

    """a bceid user cannot see other orgs recent supplier balance"""
    def test_bceid_get_recent_supplier_balance(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/recent_supplier_balance".format(self.other_organization.id))
        self.assertEqual(response.status_code, 403)

    """a bceid user cannot see another orgs assessed supplementals"""
    def test_bceid_get_assessed_supplementals_map_other_org(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/assessed_supplementals_map".format(self.other_organization.id))
        self.assertEqual(response.status_code, 403)

    """a bceid user can see their own assessed supplementals"""
    def test_bceid_get_assessed_supplementals_map(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/assessed_supplementals_map".format(self.organization.id))
        self.assertEqual(response.status_code, 200) 

    """a bceid user can see myr ids from their own org"""
    def test_bceid_get_most_recent_myr_id(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/most_recent_myr_id".format(self.organization.id))
        self.assertEqual(response.status_code, 200)
   
    """a bceid user cannot see myr ids from other orgs"""
    def test_bceid_get_most_recent_myr_id_other_org(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/most_recent_myr_id".format(self.other_organization.id))
        self.assertEqual(response.status_code, 403)

    """a bceid user cannot see compliance years for another org"""
    def test_bceid_get_compliance_years_other_org(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/compliance_years".format(self.other_organization.id))
        self.assertEqual(response.status_code, 403)

    """a bceid user can see compliance years for their own org"""
    def test_bceid_get_compliance_years(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/compliance_years".format(self.organization.id))
        self.assertEqual(response.status_code, 200)

    """a bceid  user cannot see transactions listed by year for their org"""
    def test_bceid_list_by_year(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/list_by_year".format(self.organization.id))
        self.assertEqual(response.status_code, 403)

    """a bceid  user cannot see transactions listed by year for another org"""
    def test_bceid_list_by_year_other_org(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/{}/list_by_year".format(self.other_organization.id))
        self.assertEqual(response.status_code, 403)

    """a bceid user can see model years"""
    def test_bceid_get_model_years(self):
        response = self.clients['RTAN_BCEID'].get("/api/organizations/model_years")
        self.assertEqual(response.status_code, 200)

    """
    IDIR USERS
    """

    """an idir user can see the list of orgs with balance, ldv sales, etc"""
    def test_idir_get_list_of_orgs(self):
        response = self.clients['RTAN'].get("/api/organizations")
        data = response.json()[0]
        response_keys = list(data.keys())
        self.assertEqual(response.status_code, 200)
        self.assertIn('balance', response_keys)
        self.assertIn('avgLdvSales', response_keys)
        self.assertIn('organizationAddress', response_keys)
        self.assertIn('name', response_keys)
        self.assertIn('isActive', response_keys)
        self.assertIn('supplierClass', response_keys)
        self.assertIn('isGovernment', response_keys)
        self.assertIn('ldvSales', response_keys)
        self.assertIn('hasSubmittedReport', response_keys)
        self.assertIn('firstModelYear', response_keys)
        self.assertIn('hasReport', response_keys)
   
    """an idir user can see the balance and sales of an organization"""
    def test_idir_get_organization_details(self):
        response = self.clients['RTAN'].get("/api/organizations/{}".format(self.other_organization.id))
        data = response.json()
        response_keys = list(data.keys())
        self.assertEqual(response.status_code, 200)
        self.assertIn('balance', response_keys)
        self.assertIn('avgLdvSales', response_keys)
        self.assertIn('organizationAddress', response_keys)
        self.assertIn('name', response_keys)
        self.assertIn('isActive', response_keys)
        self.assertIn('supplierClass', response_keys)
        self.assertIn('isGovernment', response_keys)
        self.assertIn('ldvSales', response_keys)
        self.assertIn('hasSubmittedReport', response_keys)
        self.assertIn('firstModelYear', response_keys)
        self.assertIn('hasReport', response_keys)
    
    """an idir user can see the users of an organization"""
    def test_idir_get_organization_users(self):
        response = self.clients['RTAN'].get("/api/organizations/{}/users".format(self.other_organization.id))
        data = response.json()
        response_keys = list(data.keys())
        self.assertEqual(response.status_code, 200)
        self.assertIn('users', response_keys)

    """an idir user can see the sales of specific orgs"""
    def test_idir_get_sales(self):
        response = self.clients['RTAN'].get("/api/organizations/{}/sales".format(self.other_organization.id))
        self.assertEqual(response.status_code, 200)

    """an idir user can see the recent supplier balance"""
    def test_idir_recent_supplier_balance(self):
        response = self.clients['RTAN'].get("/api/organizations/{}/recent_supplier_balance".format(self.other_organization.id))
        self.assertEqual(response.status_code, 200)

    """an idir user can see transactions"""
    def test_idir_get_transactions(self):
        response = self.clients['RTAN'].get("/api/organizations/{}/supplier_transactions".format(self.other_organization.id))
        self.assertEqual(response.status_code, 200)

    """an idir user can PUT ldv sales"""
    def test_idir_put_ldv_sales(self):
        response = self.clients['RTAN'].put("/api/organizations/{}/ldv_sales".format(self.organization.id),
            {"model_year": '2024', "ldv_sales": '123'},
            content_type='application/json')
        self.assertEqual(response.status_code, 200)

    """an idir user can PUT(delete) ldv sales"""
    def test_idir_delete_ldv_sales(self):
        self.clients['RTAN'].put("/api/organizations/{}/ldv_sales".format(self.organization.id),
            {"model_year": '2020', "ldv_sales": '111'},
            content_type='application/json')
        ldv = OrganizationLDVSales.objects.first()
        response = self.clients['RTAN'].put("/api/organizations/{}/ldv_sales".format(self.organization.id),
            {"id": ldv.id},
            content_type='application/json')
        self.assertEqual(response.status_code, 200)

    """an idir user can see assessed supplementals map"""
    def test_idir_get_assessed_supplementals_map(self):
        response = self.clients['RTAN'].get("/api/organizations/{}/assessed_supplementals_map".format(self.other_organization.id))
        self.assertEqual(response.status_code, 200) 

    """an idir user can see myr ids for an org"""
    def test_idir_get_most_recent_myr_id(self):
        response = self.clients['RTAN'].get("/api/organizations/{}/most_recent_myr_id".format(self.other_organization.id))
        self.assertEqual(response.status_code, 200)

    """an idir user can see compliance years for an org"""
    def test_idir_get_compliance_years(self):
        response = self.clients['RTAN'].get("/api/organizations/{}/compliance_years".format(self.other_organization.id))
        self.assertEqual(response.status_code, 200)

    """an idir user can see transactions listed by year an org"""
    def test_idir_list_by_year(self):
        response = self.clients['RTAN'].get("/api/organizations/{}/list_by_year".format(self.other_organization.id))
        self.assertEqual(response.status_code, 200)

    """an idir user can see model years"""
    def test_idir_get_model_years(self):
        response = self.clients['RTAN'].get("/api/organizations/model_years")
        self.assertEqual(response.status_code, 200)
        

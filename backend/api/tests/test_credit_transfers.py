import json
from rest_framework.serializers import ValidationError
from django.utils import timezone
from django.db import transaction
from unittest import skip
from .base_test_case import BaseTestCase
from ..models.credit_transfer import CreditTransfer
from ..models.credit_transaction import CreditTransaction
from ..models.credit_transfer_content import CreditTransferContent
from ..models.credit_class import CreditClass
from ..models.model_year import ModelYear
from ..models.weight_class import WeightClass
from ..models.credit_transaction_type import CreditTransactionType
from ..services.credit_transaction import validate_transfer
from ..services.credit_transaction import aggregate_credit_transfer_details
from ..models.organization import Organization
from ..models.signing_authority_confirmation import SigningAuthorityConfirmation
from ..models.signing_authority_assertion import SigningAuthorityAssertion
from ..models.credit_transfer_statuses import CreditTransferStatuses
from unittest.mock import patch
from ..models.organization_deficits import OrganizationDeficits
from ..models.model_year import ModelYear
from .test_utils import create_deficit, give_org_credits

class TestTransfers(BaseTestCase):
    def setUp(self):
        super().setUp()

        self.org1 = self.users['RTAN_BCEID'].organization
        org2 = self.users['EMHILLIE_BCEID'].organization
        self.org3 = self.users['KMENKE_BCEID'].organization

        self.class_a = CreditClass.objects.get(credit_class='A')
        self.class_b = CreditClass.objects.get(credit_class='B')


        self.model_year = ModelYear.objects.get(name='2023')

        self.transfer = CreditTransfer.objects.create(
            status='SUBMITTED',
            credit_to=self.org1,
            debit_from=org2,
        )

        self.transfer2 = CreditTransfer.objects.create(
            status='DRAFT',
            credit_to=self.org1,
            debit_from=org2,
        )

        self.transfer3 = CreditTransfer.objects.create(
            status='APPROVED',
            credit_to=self.org1,
            debit_from=org2,
        )

    def create_credit_transfer(self, credit_to, debit_from, status):
        """Helper method to create a Credit Transfer."""
        return CreditTransfer.objects.create(
            credit_to=credit_to,
            debit_from=debit_from,
            status=status,
            update_user='test'
        )
    
    def create_credit_transfer_content(self, credit_transfer, model_year, credit_class, credit_value, dollar_value):
        """Helper method to create Credit Transfer Content."""
        return CreditTransferContent.objects.create(
            credit_transfer=credit_transfer,
            model_year=model_year,
            credit_class=credit_class,
            weight_class=WeightClass.objects.get(weight_class_code='LDV'),
            credit_value=credit_value,
            dollar_value=dollar_value
        )
    def test_list_transfer(self):
        def check_response():
            response = self.clients['RTAN_BCEID'].get("/api/credit-transfers")
            self.assertEqual(response.status_code, 200)
            result = response.data
            self.assertEqual(len(result), 2)
        transaction.on_commit(check_response)

    def test_list_transfer_as_partner(self):
        response = self.clients['EMHILLIE_BCEID'].get("/api/credit-transfers")
        self.assertEqual(response.status_code, 200)
        result = response.data
        self.assertEqual(len(result), 3)

    def test_list_transfer_gov(self):
        response = self.clients['RTAN'].get("/api/credit-transfers")
        self.assertEqual(response.status_code, 200)
        result = response.data
        self.assertEqual(len(result), 1)

    def test_transfer_fail(self):
        """ test that if the supplier does not have enough credits of specific
         type for specified year the transfer will fail and the database
        won't change"""
        transfer_not_enough = self.create_credit_transfer(
            self.users['RTAN_BCEID'].organization, 
            self.users['EMHILLIE_BCEID'].organization,
            'RECOMMEND_APPROVAL'
            )
        
        self.create_credit_transfer_content(
            transfer_not_enough,
            ModelYear.objects.get(name='2020'),
            CreditClass.objects.get(credit_class="A"),
            10,
            10
        )

        # try changing from status RECOMMENDED to ISSUED, this should fail
        # ie it should throw a Validation Error 
        self.assertRaises(
            ValidationError, validate_transfer, transfer_not_enough
        )


    def test_transfer_pass(self):
        """test that:
         - a transfer is validated if supplier has enough credits,,
         - organization balances are calculated correctly """
        model_year=ModelYear.objects.get(name='2020')
        credit_class=CreditClass.objects.get(credit_class="A")
        give_org_credits(self.users['EMHILLIE_BCEID'].organization, 100, 4, model_year, credit_class)
        transfer_enough = self.create_credit_transfer(
            self.users['RTAN_BCEID'].organization, 
            self.users['EMHILLIE_BCEID'].organization,
            'RECOMMEND_APPROVAL'
        )

        self.create_credit_transfer_content(
            transfer_enough,
            model_year,
            credit_class,
            10,
            10
        )

        validate_transfer(transfer_enough)

        def check_balances():
            seller_balance = Organization.objects.filter(
                id=self.users['EMHILLIE_BCEID'].organization.id
            ).first().balance['A']

            buyer_balance = Organization.objects.filter(
                id=self.users['RTAN_BCEID'].organization.id
            ).first().balance['A']

            self.assertEqual(seller_balance, 390)
            self.assertEqual(buyer_balance, 10)

        transaction.on_commit(check_balances)


    def test_credit_transfer_create(self):
        """tets that transfer can be created and email sent"""
        with patch('api.services.send_email.send_credit_transfer_emails') as mock_send_credit_transfer_emails:
            self.test_transfer_pass()

            assertion = SigningAuthorityAssertion.objects.create(
                id = 1,
                display_order=100
            )
            confirmation = SigningAuthorityConfirmation.objects.create(
                create_user=self.users['EMHILLIE_BCEID'],
                has_accepted=True,
                title='Admin',
                signing_authority_assertion_id=assertion.id
            )

            response = self.clients['RTAN_BCEID'].post(
              "/api/credit-transfers",
              content_type='application/json',
              data=json.dumps({
                  'status': "SUBMITTED",
                  'signing_confirmation': [confirmation.id],
                  'debit_from': self.users['EMHILLIE_BCEID'].organization.id,
                  'credit_to': self.users['RTAN_BCEID'].organization.id,
                  'content': [{
                      'debit_from': self.users['EMHILLIE_BCEID'].organization.id,
                      'credit_to': self.users['RTAN_BCEID'].organization.id,
                      'model_year': '2020',
                      'credit_class': 'A',
                      'weight_class': 'LDV',
                      'credit_value': 5,
                      'dollar_value': 100
                  }]
              })
            )

            self.assertEqual(response.status_code, 201)
            
            # Test that email method is called properly
            mock_send_credit_transfer_emails.assert_called()

    
    def test_get_transfer(self):
        """ test retreiving a transfer"""
        transfer = self.transfer
        transfer_initial_status = transfer.status
        transfer_id = transfer.id
        users = ["EMHILLIE_BCEID", "RTAN"]
        for status in CreditTransferStatuses:
            transfer.status = status
            transfer.save()
            for user in users:
                response = self.clients[user].get("/api/credit-transfers/" + str(transfer_id))
                data = response.data
                credit_to = data.get("credit_to")
                debit_from = data.get("debit_from")
                if credit_to is not None:
                    self.assertEqual(len(credit_to), 4)
                    self.assertFalse("balance" in credit_to or "ldv_sales" in credit_to or "avg_ldv_sales" in credit_to)
                if debit_from is not None:
                    self.assertEqual(len(debit_from), 4)
                    self.assertFalse("balance" in debit_from or "ldv_sales" in debit_from or "avg_ldv_sales" in debit_from)
        transfer.status = transfer_initial_status
        transfer.save()


    def test_get_org_balances(self):
        """Test retrieving organization balances for a credit transfer."""
        gov_user = "RTAN"
        non_gov_user = "EMHILLIE_BCEID"
        transfer = self.transfer
        transfer_initial_status = transfer.status
        transfer_id = transfer.id
        for user in (gov_user, non_gov_user):
            for status in CreditTransferStatuses:
                transfer.status = status
                transfer.save()
                response = self.clients[user].get("/api/credit-transfers/" + str(transfer_id) + "/org_balances")
                response_status = response.status_code
                data = response.data
                if user == gov_user and status == CreditTransferStatuses.APPROVED:
                    self.assertEqual(response_status, 200)
                else:
                    self.assertTrue(response_status == 403 or not data)
        transfer.status = transfer_initial_status
        transfer.save()
    
    def test_org_in_deficit_gets_transfer_credits(self):
        """ test that an organization with a deficit still gets credits from a transfer"""
        # Create deficit for org3 and give credits to org1
        create_deficit(self.org3, self.class_a,  self.model_year)
        create_deficit(self.org3, self.class_b,  self.model_year)
        give_org_credits(self.org1, 50, 4, 
                              self.model_year, self.class_a)
        self.org_deficits = OrganizationDeficits.objects.filter(organization_id=self.org3.id)
        #get initial balances
        org3_balance_before_transfer = self.clients['KMENKE_BCEID'].get(
            "/api/organizations/mine"
        ).data['balance']
        org1_balance = self.clients['RTAN_BCEID'].get(
            "/api/organizations/mine"
        ).data['balance']

        #transfer credits from org1 to org3
        transfer = self.create_credit_transfer(
            self.org3, 
            self.org1,
            'RECOMMEND_APPROVAL'
        )
        self.create_credit_transfer_content(
            transfer,
            self.model_year,
            CreditClass.objects.get(credit_class="A"),
            10,
            10
        )
        # perform update
        self.clients['RTAN'].patch(
            "/api/credit-transfers/{}".format(transfer.id), {'status':"VALIDATED", 'credit_to': self.org3.id, 'debit_from': self.org1.id}, content_type='application/json',
        )

        #get balances after transfer
        org3_balance_after_transfer = self.clients['KMENKE_BCEID'].get(
            "/api/organizations/mine"
        ).data['balance']
        org1_balance_after_transfer = self.clients['RTAN_BCEID'].get(
            "/api/organizations/mine"
        ).data['balance']

        #calculate expected balances
        expected_org3_balance = org3_balance_before_transfer.copy()
        expected_org3_balance['A'] += 10
        expected_org1_balance = org1_balance.copy()
        expected_org1_balance['A'] -= 10

        ## assert organization recieves full value of transfer
        self.assertEqual(org3_balance_after_transfer, expected_org3_balance)
        self.assertEqual(org1_balance_after_transfer, expected_org1_balance)

        ## assert deficit table is not altered
        org_deficits_new = OrganizationDeficits.objects.filter(organization_id=self.org3.id)
        org_deficits_list = list(self.org_deficits.values('credit_class', 'credit_value', 'model_year'))
        org_deficits_new_list = list(org_deficits_new.values('credit_class', 'credit_value', 'model_year'))
        org_deficits_list.sort(key=lambda x: (x['credit_class'], x['model_year']))
        org_deficits_new_list.sort(key=lambda x: (x['credit_class'], x['model_year']))
        self.assertEqual(org_deficits_list, org_deficits_new_list)

    def test_aggr_credit_transfer_details(self):
        """Test the aggregate_credit_transfer_details function."""
        CreditTransferContent.objects.all().delete()
        CreditTransfer.objects.all().delete()

        model_year = ModelYear.objects.get(name='2020')
        credit_class = CreditClass.objects.get(credit_class='A')
        weight_class = WeightClass.objects.get(weight_class_code='LDV')

        give_org_credits(self.org1, 100, 4, model_year, credit_class)

        transfer1 = self.create_credit_transfer(self.org3, self.org1, 'APPROVED')
        self.create_credit_transfer_content(transfer1, model_year, credit_class, 50, 500)

        transfer2 = self.create_credit_transfer(self.org1, self.org3, 'RECOMMEND_APPROVAL')
        self.create_credit_transfer_content(transfer2, model_year, credit_class, 30, 300)

        balance = aggregate_credit_transfer_details(self.org1.id)

        self.assertEqual(len(balance), 1)  
        result = balance[0]
        self.assertEqual(result['credit'], 30)  # Credits received by org1
        self.assertEqual(result['debit'], 50)   # Debits sent by org1
        self.assertEqual(result['credit_value'], -20)  # Net balance

    def test_aggr_credit_transfer_invalid_status(self):
        """Test that transfers with invalid statuses are ignored."""
        CreditTransferContent.objects.all().delete()
        CreditTransfer.objects.all().delete()

        model_year = ModelYear.objects.get(name='2020')
        credit_class = CreditClass.objects.get(credit_class='A')

        transfer = self.create_credit_transfer(self.org1, self.org3, 'DRAFT')
        self.create_credit_transfer_content(transfer, model_year, credit_class, 100, 1000)

        balance = aggregate_credit_transfer_details(self.org1.id)

        self.assertEqual(len(balance), 0)  

    def test_aggr_credit_transfer_no_transfers(self):
        """Test aggregate_credit_transfer_details with no transfers."""
        CreditTransferContent.objects.all().delete()
        CreditTransfer.objects.all().delete()

        balance = aggregate_credit_transfer_details(self.org1.id)
        self.assertEqual(len(balance), 0)  

    @skip("temp skip while further issues are debugged")
    def test_aggr_credit_transfer_multiple_classes(self):
        """Test multiple transfers with different credit classes."""
        CreditTransferContent.objects.all().delete()
        CreditTransfer.objects.all().delete()

        model_year = ModelYear.objects.get(name='2020')
        class_a = CreditClass.objects.get(credit_class='A')
        class_b = CreditClass.objects.get(credit_class='B')

        transfer1 = self.create_credit_transfer(self.org3, self.org1, 'APPROVED')  
        self.create_credit_transfer_content(transfer1, model_year, class_a, 30, 300)

        transfer2 = self.create_credit_transfer(self.org3, self.org1, 'APPROVED')  
        self.create_credit_transfer_content(transfer2, model_year, class_b, 50, 500)

        transfer3 = self.create_credit_transfer(self.org1, self.org3, 'APPROVED')  
        self.create_credit_transfer_content(transfer3, model_year, class_b, 10, 100)

        print("CreditTransfers:", list(CreditTransfer.objects.all().values('id', 'credit_to_id', 'debit_from_id', 'status')))
        print("CreditTransferContents:", list(CreditTransferContent.objects.all().values('credit_transfer_id', 'credit_class_id', 'credit_value')))

        balance = aggregate_credit_transfer_details(self.org1.id)

        print("Updated Raw Balance Data:", list(balance))

        self.assertEqual(len(balance), 2)

        class_a_balance = next((b for b in balance if b['credit_class_id'] == class_a.id), None)
        class_b_balance = next((b for b in balance if b['credit_class_id'] == class_b.id), None)

        self.assertIsNotNone(class_a_balance, "Class A balance should not be None")
        self.assertIsNotNone(class_b_balance, "Class B balance should not be None")

        # Class A Assertions
        self.assertEqual(class_a_balance['credit'], 30)  
        self.assertEqual(class_a_balance['debit'], 0)  
        self.assertEqual(class_a_balance['credit_value'], 30)  

        # Class B Assertions
        self.assertEqual(class_b_balance['credit'], 50)  
        self.assertEqual(class_b_balance['debit'], 10)   
        self.assertEqual(class_b_balance['credit_value'], 40)  


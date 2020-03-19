from collections import namedtuple

from .base_test_case import BaseTestCase
from ..models.credit_class import CreditClass
from ..models.credit_transaction import CreditTransaction
from ..models.credit_transaction_type import CreditTransactionType


class TestOrganizations(BaseTestCase):

    def setUp(self):
        super().setUp()

        org1 = self.users['vs_user_1'].organization
        org2 = self.users['vs_user_2'].organization
        gov = self.users['engineer'].organization

        validation = CreditTransactionType.objects.get(transaction_type='Validation')
        reduction = CreditTransactionType.objects.get(transaction_type='Reduction')

        class_a = CreditClass.objects.get(credit_class='A')
        class_b = CreditClass.objects.get(credit_class='B')

        CreatedTransaction = namedtuple('CreatedTransaction', ('credit', 'debit', 'creditclass', 'type', 'value'))

        to_create = [
            CreatedTransaction(org1, gov, class_a, validation, 100.0),
            CreatedTransaction(org1, gov, class_b, validation, 50.0),
            CreatedTransaction(gov, org1, class_a, reduction, 93.0),
            CreatedTransaction(org1, gov, class_b, validation, 50.0),
            CreatedTransaction(org1, gov, class_b, validation, 45.0),
            CreatedTransaction(org2, gov, class_a, validation, 99.0),
        ]

        # assertions based on test data
        self.GOV_TRANSACTION_COUNT = 6
        self.ORG1_TRANSACTION_COUNT = 5
        self.ORG2_TRANSACTION_COUNT = 1
        self.ORG1_BALANCE_A = 7
        self.ORG1_BALANCE_B = 145
        self.ORG2_BALANCE_A = 99
        self.ORG2_BALANCE_B = 0

        for t in to_create:
            CreditTransaction.objects.create(
                credit_to=t.credit,
                debit_from=t.debit,
                credit_class=t.creditclass,
                transaction_type=t.type,
                credit_value=t.value,
            )

    def test_org1_credits(self):
        response = self.clients['vs_user_1'].get("/api/credits")
        self.assertEqual(response.status_code, 200)
        result = response.data
        self.assertEqual(len(result), self.ORG1_TRANSACTION_COUNT)

        response = self.clients['vs_user_1'].get("/api/organizations/mine")
        self.assertEqual(response.status_code, 200)
        result = response.data
        self.assertEqual(result['balance']['A'], self.ORG1_BALANCE_A)
        self.assertEqual(result['balance']['B'], self.ORG1_BALANCE_B)

    def test_org2_credits(self):
        response = self.clients['vs_user_2'].get("/api/credits")
        self.assertEqual(response.status_code, 200)
        result = response.data
        self.assertEqual(len(result), self.ORG2_TRANSACTION_COUNT)

        response = self.clients['vs_user_2'].get("/api/organizations/mine")
        self.assertEqual(response.status_code, 200)
        result = response.data
        self.assertEqual(result['balance']['A'], self.ORG2_BALANCE_A)
        self.assertEqual(result['balance']['B'], self.ORG2_BALANCE_B)

    def test_gov_credits(self):
        response = self.clients['engineer'].get("/api/credits")
        self.assertEqual(response.status_code, 200)

        result = response.data
        self.assertEqual(len(result), self.GOV_TRANSACTION_COUNT)


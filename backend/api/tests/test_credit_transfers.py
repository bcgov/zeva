from django.utils.datetime_safe import datetime
from rest_framework.serializers import ValidationError

from .base_test_case import BaseTestCase
from ..models.credit_transfer import CreditTransfer

class TestTransfers(BaseTestCase):
    def setUp(self):
        super().setUp()

        org1 = self.users['RTAN_BCEID'].organization
        org2 = self.users['EMHILLIE_BCEID'].organization

        gov_user = self.users['RTAN'].organization

        transfer = CreditTransfer.objects.create(
            status='SUBMITTED',
            credit_to=org1,
            debit_from=org2,
        )

        transfer2 = CreditTransfer.objects.create(
            status='DRAFT',
            credit_to=org1,
            debit_from=org2,
        )

        transfer3 = CreditTransfer.objects.create(
            status='APPROVED',
            credit_to=org1,
            debit_from=org2,
        )

    def test_list_transfer(self):
        response = self.clients['RTAN_BCEID'].get("/api/credit-transfers")
        self.assertEqual(response.status_code, 200)
        result = response.data
        self.assertEqual(len(result), 2)

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

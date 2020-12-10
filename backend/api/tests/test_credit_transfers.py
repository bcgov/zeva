from django.utils.datetime_safe import datetime
from django.core.exceptions import ValidationError

from .base_test_case import BaseTestCase
from ..models.credit_transfer import CreditTransfer
from ..models.credit_transaction import CreditTransaction
from ..models.credit_transfer_content import CreditTransferContent
from ..models.credit_class import CreditClass
from ..models.model_year import ModelYear
from ..models.weight_class import WeightClass
from ..models.credit_transaction_type import CreditTransactionType
from ..services.credit_transaction import validate_transfer
from ..models.account_balance import AccountBalance


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

    # test that if the supplier does not have enough credits of specific
    # type for specified year the transfer will fail and the database
    # won't change
    def test_transfer_fail(self):
        transfer_not_enough = CreditTransfer.objects.create(
            debit_from=self.users['RTAN_BCEID'].organization,
            status='RECOMMEND_APPROVAL',
            credit_to=self.users['EMHILLIE_BCEID'].organization,
        )
        transfer_content = CreditTransferContent.objects.create(
            model_year=ModelYear.objects.get(name='2020'),
            credit_class=CreditClass.objects.get(credit_class="A"),
            weight_class=WeightClass.objects.get(weight_class_code='LDV'),
            credit_value=10,
            dollar_value=10,
            credit_transfer=transfer_not_enough,
        )

        # try changing from status RECOMMENDED to ISSUED, this should fail
        # ie it should throw a Validation Error
        self.assertRaises(
            ValidationError, validate_transfer, transfer_not_enough)


    # test that if the supplier does have enough of credit type/year the
    # transfer will work, a record will be added for each row in transfer
    # content (or unique credit type/year/weight) in the transaction table,
    #  and a new row for each credit type for each organization in the
    # account balance table. 

    def test_transfer_pass(self):
        transaction = CreditTransaction.objects.create(
            credit_to=self.users['EMHILLIE_BCEID'].organization,
            model_year=ModelYear.objects.get(name='2020'),
            credit_class=CreditClass.objects.get(credit_class="A"),
            weight_class=WeightClass.objects.get(weight_class_code='LDV'),
            credit_value=4,
            number_of_credits=100,
            total_value=400,
            transaction_type=CreditTransactionType.objects.get(
                transaction_type="Validation")
        )
        transfer_enough = CreditTransfer.objects.create(
            credit_to=self.users['RTAN_BCEID'].organization,
            status='RECOMMEND_APPROVAL',
            debit_from=self.users['EMHILLIE_BCEID'].organization,
            update_user=self.users['EMHILLIE_BCEID'],
        )
        
        transfer_content = CreditTransferContent.objects.create(
            model_year=ModelYear.objects.get(name='2020'),
            credit_class=CreditClass.objects.get(credit_class="A"),
            weight_class=WeightClass.objects.get(weight_class_code='LDV'),
            credit_value=10,
            dollar_value=10,
            credit_transfer=transfer_enough,
        )

        validate_transfer(transfer_enough)

        seller_balance = AccountBalance.objects.filter(
            organization_id=self.users['EMHILLIE_BCEID'].organization.id,
            expiration_date=None,
            credit_class=CreditClass.objects.get(credit_class="A")
        ).first()

        buyer_balance = AccountBalance.objects.filter(
            organization_id=self.users['RTAN_BCEID'].organization.id,
            expiration_date=None,
            credit_class=CreditClass.objects.get(credit_class="A")
        ).first()

        self.assertEqual(seller_balance.balance, -10)
        self.assertEqual(buyer_balance.balance, 10)

        credit_transaction_record = CreditTransaction.objects.filter(
            credit_to=self.users['RTAN_BCEID'].organization,
            debit_from=self.users['EMHILLIE_BCEID'].organization,
            credit_class=CreditClass.objects.get(credit_class="A"),
        ).order_by('-id').first()
        self.assertEqual(credit_transaction_record.id, seller_balance.credit_transaction_id)

        
       

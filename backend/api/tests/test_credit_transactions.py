from collections import namedtuple
from django.db.models import Q, Sum

from .base_test_case import BaseTestCase
from ..models.credit_class import CreditClass
from ..models.credit_transaction import CreditTransaction
from ..models.credit_transaction_type import CreditTransactionType
from ..models.vehicle import Vehicle
from ..models.weight_class import WeightClass
from django.utils import timezone


class TestOrganizations(BaseTestCase):

    def setUp(self):
        super().setUp()

        self.org1 = self.users['RTAN_BCEID'].organization
        self.org2 = self.users['EMHILLIE_BCEID'].organization
        self.gov = self.users['RTAN'].organization

        validation = CreditTransactionType.objects.get(
            transaction_type='Validation'
        )
        reduction = CreditTransactionType.objects.get(
            transaction_type='Reduction'
        )

        class_a = CreditClass.objects.get(credit_class='A')
        class_b = CreditClass.objects.get(credit_class='B')

        CreatedTransaction = namedtuple(
            'CreatedTransaction', (
                'credit', 'debit', 'creditclass', 'type', 'value', 'vehicle'
            )
        )

        org1_vehicle = Vehicle.objects.filter(organization=self.org1).first()
        org2_vehicle = Vehicle.objects.filter(organization=self.org2).first()

        to_create = [
            CreatedTransaction(
                self.org1, None, class_a, validation, 100.0, org1_vehicle
            ),
            CreatedTransaction(
                self.org1, None, class_b, validation, 50.0, org1_vehicle
            ),
            CreatedTransaction(
                None, self.org1, class_a, reduction, 93.0, org1_vehicle
            ),
            CreatedTransaction(
                self.org1, None, class_b, validation, 50.0, org1_vehicle
            ),
            CreatedTransaction(
                self.org1, None, class_b, validation, 45.0, org1_vehicle
            ),
            CreatedTransaction(
                self.org2, None, class_a, validation, 99.0, org2_vehicle
            ),
        ]

        for t in to_create:
            if t.vehicle:
                CreditTransaction.objects.create(
                    credit_to=t.credit,
                    debit_from=t.debit,
                    credit_class=t.creditclass,
                    transaction_type=t.type,
                    number_of_credits=t.value,
                    model_year=t.vehicle.model_year,
                    credit_value=t.vehicle.get_credit_value(),
                    total_value=t.value * t.vehicle.get_credit_value(),
                    weight_class=WeightClass.objects.get(weight_class_code='LDV'),
                    transaction_timestamp=timezone.now(),
                )

    def test_org1_credits(self):
        response = self.clients['RTAN_BCEID'].get("/api/credit-transactions")
        self.assertEqual(response.status_code, 200)
        result = response.data

        count = CreditTransaction.objects.filter(
            Q(debit_from_id=self.org1.id) |
            Q(credit_to_id=self.org1.id)
        ).values(
            'model_year_id', 'credit_class_id', 'transaction_type_id',
            'weight_class_id'
        ).annotate(
            # This isn't how you calculate the total credits,
            # this is just to force the group by
            total_value=Sum('total_value')
        ).count()

        self.assertEqual(len(result), count)

        response = self.clients['RTAN_BCEID'].get(
            "/api/organizations/mine"
        )
        self.assertEqual(response.status_code, 200)
        result = response.data

    def test_org2_credits(self):
        response = self.clients['EMHILLIE_BCEID'].get(
            "/api/credit-transactions"
        )
        self.assertEqual(response.status_code, 200)
        result = response.data

        count = CreditTransaction.objects.filter(
            Q(debit_from_id=self.org2.id) |
            Q(credit_to_id=self.org2.id)
        ).values(
            'model_year_id', 'credit_class_id', 'transaction_type_id',
            'weight_class_id'
        ).annotate(
            total_value=Sum('total_value')
        ).count()

        self.assertEqual(len(result), count)

        response = self.clients['EMHILLIE_BCEID'].get(
            "/api/organizations/mine"
        )
        self.assertEqual(response.status_code, 200)
        result = response.data

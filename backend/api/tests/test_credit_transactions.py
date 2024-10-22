from collections import namedtuple
from django.db.models import Q, Sum
from .base_test_case import BaseTestCase
from ..models.credit_class import CreditClass
from ..models.credit_transaction import CreditTransaction
from ..models.credit_transaction_type import CreditTransactionType
from ..models.vehicle import Vehicle
from ..models.weight_class import WeightClass
from django.utils import timezone
from ..models.organization_deficits import OrganizationDeficits
from ..models.model_year import ModelYear
from ..models.sales_submission import SalesSubmission
from ..models.sales_submission_statuses import SalesSubmissionStatuses
from ..models.record_of_sale_statuses import RecordOfSaleStatuses
from ..models.record_of_sale import RecordOfSale
from ..models.vin_statuses import VINStatuses
from ..models.vehicle_zev_type import ZevType
from ..models.vehicle_class import VehicleClass
from .test_utils import create_deficit


class TestCreditTransactions(BaseTestCase):

    def setUp(self):
        super().setUp()

        self.org1 = self.users['RTAN_BCEID'].organization
        self.org2 = self.users['EMHILLIE_BCEID'].organization
        self.org3 = self.users['KMENKE_BCEID'].organization
        self.gov = self.users['RTAN'].organization

        self.validation = CreditTransactionType.objects.get(
            transaction_type='Validation'
        )
        reduction = CreditTransactionType.objects.get(
            transaction_type='Reduction'
        )

        self.class_a = CreditClass.objects.get(credit_class='A')
        self.class_b = CreditClass.objects.get(credit_class='B')

        CreatedTransaction = namedtuple(
            'CreatedTransaction', (
                'credit', 'debit', 'creditclass', 'type', 'value', 'vehicle'
            )
        )

        self.org1_vehicle = Vehicle.objects.filter(organization=self.org1).first()
        org2_vehicle = Vehicle.objects.filter(organization=self.org2).first()
        
        self.credit_class = CreditClass.objects.all().first()
        vehicle_class = VehicleClass.objects.all().first()
        zev_type = ZevType.objects.all().first()
        self.model_year = ModelYear.objects.get(name='2023')
        self.org3_vehicle = Vehicle.objects.create(
                organization=self.org3,
                model_year=self.model_year,  
                credit_class=self.credit_class,
                range=300,
                make="TEST",
                validation_status="VALIDATED",
                model_name="test vehicle",
                credit_value=.65,
                vehicle_zev_type=zev_type,
                vehicle_class_code=vehicle_class,
                weight_kg=20
            )
        to_create = [
            CreatedTransaction(
                self.org1, None, self.class_a, self.validation, 100.0, self.org1_vehicle
            ),
            CreatedTransaction(
                self.org1, None, self.class_b, self.validation, 50.0, self.org1_vehicle
            ),
            CreatedTransaction(
                None, self.org1, self.class_a, reduction, 93.0, self.org1_vehicle
            ),
            CreatedTransaction(
                self.org1, None, self.class_b, self.validation, 50.0, self.org1_vehicle
            ),
            CreatedTransaction(
                self.org1, None, self.class_b, self.validation, 45.0, self.org1_vehicle
            ),
            CreatedTransaction(
                self.org2, None, self.class_a, self.validation, 99.0, org2_vehicle
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
                    model_year=self.model_year,
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

    def test_org_in_deficit_gets_credits(self):
        """test that an org with a deficit still gets credits from a validation"""
        # get initial balance
        initial_balance= self.clients['KMENKE_BCEID'].get(
            "/api/organizations/mine"
        ).data['balance']

        # create a deficit so we can make sure it doesnt change when credits are awarded
        create_deficit(self.org3, self.class_a,  self.model_year)
        create_deficit(self.org3, self.class_b,  self.model_year)

        org_deficits = OrganizationDeficits.objects.filter(organization_id=self.org3.id)

        #create sales submission
        submission= SalesSubmission.objects.create(
            organization=self.users['KMENKE_BCEID'].organization,
            submission_sequence=1,
            validation_status=SalesSubmissionStatuses.NEW
        )
        submission.validation_status = SalesSubmissionStatuses.RECOMMEND_APPROVAL
        submission.save()
        ros = RecordOfSale(
            submission=submission,
            vin_validation_status=VINStatuses.UNCHECKED,
            vin='ABC123',
            validation_status=RecordOfSaleStatuses.VALIDATED,
            sale_date=timezone.now(),
            vehicle=self.org3_vehicle
        )
        ros.save()
        credit_value = self.org3_vehicle.get_credit_value()
        total_value = 1 * credit_value # hard coding 1 because we are just doing a single vehicle
        # perform update
        self.clients['RTAN'].patch(
            "/api/credit-requests/{}".format(submission.id), {'validation_status':"VALIDATED"}, content_type='application/json',
        )

        ## check that  deficit table is not altered
        org_deficits_new = OrganizationDeficits.objects.filter(organization_id=self.org3.id)
        org_deficits_list = list(org_deficits.values('credit_class', 'credit_value', 'model_year'))
        org_deficits_new_list = list(org_deficits_new.values('credit_class', 'credit_value', 'model_year'))
        org_deficits_list.sort(key=lambda x: (x['credit_class'], x['model_year']))
        org_deficits_new_list.sort(key=lambda x: (x['credit_class'], x['model_year']))
        self.assertEqual(org_deficits_list, org_deficits_new_list)
    
        # calculate the original balance plus the total from the sales submission
        new_calculated_balance = initial_balance.copy()
        new_calculated_balance[self.credit_class.credit_class] += total_value

        #assert that expected balance equals the final org response balance
        balance_after_submission = self.clients['KMENKE_BCEID'].get(
            "/api/organizations/mine"
        ).data['balance']
        self.assertEqual(new_calculated_balance, balance_after_submission)


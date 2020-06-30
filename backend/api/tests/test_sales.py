from django.utils.datetime_safe import datetime
from rest_framework.serializers import ValidationError

from .base_test_case import BaseTestCase
from ..models.record_of_sale import RecordOfSale
from ..models.record_of_sale_statuses import RecordOfSaleStatuses
from ..models.sales_submission import SalesSubmission
from ..models.vehicle import Vehicle
from ..models.vin_statuses import VINStatuses


class TestSales(BaseTestCase):
    def setUp(self):
        super().setUp()

        org1 = self.users['RTAN_BCEID'].organization

        sub = SalesSubmission.objects.create(
            organization=org1,
        )

        vehicle = Vehicle.objects.filter(organization=org1).first()

        if vehicle:
            ros = RecordOfSale(
                submission=sub,
                vin_validation_status=VINStatuses.UNCHECKED,
                vin='ABC123',
                validation_status=RecordOfSaleStatuses.DRAFT,
                sale_date=datetime.utcnow(),
                vehicle=vehicle
            )

            ros.save()

    def test_list_sales_fs(self):
        response = self.clients['RTAN_BCEID'].get("/api/sales")
        self.assertEqual(response.status_code, 200)

    def test_list_sales_gov(self):
        response = self.clients['RTAN'].get("/api/sales")
        self.assertEqual(response.status_code, 200)

    def test_validate_validation_status(self):
        sub = SalesSubmission.objects.create(
            organization=self.users['RTAN_BCEID'].organization,
            submission_sequence=1,
            validation_status='NEW'
        )

        request = {
            'user': self.users['RTAN_BCEID']
        }

        # try changing from status NEW to VALIDATED, this should fail
        # ie it should throw a Validation Error
        self.assertRaises(
            ValidationError, sub.validate_validation_status(
                'VALIDATED', request
            )
        )

        sub.validation_status = 'RECOMMEND_APPROVAL'
        sub.save()

        # try changing from status RECOMMEND_APPROVAL to DELETED, this should
        # fail
        # ie it should throw a Validation Error
        self.assertRaises(
            ValidationError, sub.validate_validation_status('DELETED', request)
        )        

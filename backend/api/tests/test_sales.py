from django.utils.datetime_safe import datetime

from .base_test_case import BaseTestCase
from ..models.record_of_sale import RecordOfSale
from ..models.record_of_sale_statuses import RecordOfSaleStatuses
from ..models.vehicle import Vehicle
from ..models.vin_statuses import VINStatuses


class TestSales(BaseTestCase):

    extra_fixtures = ['api/fixtures/test/test_vehicles.json']

    def setUp(self):
        super().setUp()

        org1 = self.users['vs_user_1'].organization

        ros = RecordOfSale(
            organization=org1,
            vin_validation_status=VINStatuses.UNCHECKED,
            vin='ABC123',
            validation_status=RecordOfSaleStatuses.DRAFT,
            sale_date=datetime.utcnow(),
            vehicle=Vehicle.objects.get(id=1)
        )

        ros.save()

    def test_list_sales_fs(self):
        response = self.clients['vs_user_1'].get("/api/sales")
        self.assertEqual(response.status_code, 200)

    def test_list_sales_gov(self):
        response = self.clients['engineer'].get("/api/sales")
        self.assertEqual(response.status_code, 200)

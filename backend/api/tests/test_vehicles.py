import json

from .base_test_case import BaseTestCase



class TestVehicles(BaseTestCase):
    extra_fixtures = ['api/fixtures/test/test_vehicles.json']

    def test_get_vehicles(self):
        response = self.clients['vs_user_1'].get("/api/vehicles")
        self.assertEqual(response.status_code, 200)

    def test_update_vehicle_state(self):
        response = self.clients['vs_user_1'].patch(
            "/api/vehicles/1/state_change",
            content_type='application/json',
            data=json.dumps({'validation_status': "SUBMITTED"})
        )
        self.assertEqual(response.status_code, 200)

        response = self.clients['vs_user_1'].get("/api/vehicles")
        self.assertEqual(response.status_code, 200)

        response = self.clients['vs_user_1'].patch(
            "/api/vehicles/1/state_change",
            content_type='application/json',
            data=json.dumps({'validation_status': "VALIDATED"})
        )
        self.assertEqual(response.status_code, 403)

        response = self.clients['engineer'].patch(
            "/api/vehicles/1/state_change",
            content_type='application/json',
            data=json.dumps({'validation_status': "VALIDATED"})
        )
        self.assertEqual(response.status_code, 200)

        response = self.clients['vs_user_1'].get("/api/vehicles/1")
        self.assertEqual(response.status_code, 200)

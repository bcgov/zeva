import json

from .base_test_case import BaseTestCase
from ..models.vehicle import Vehicle


class TestVehicles(BaseTestCase):
    def test_get_vehicles(self):
        response = self.clients['RTAN_BCEID'].get("/api/vehicles")
        self.assertEqual(response.status_code, 200)

    def test_update_vehicle_state(self):
        org1 = self.users['RTAN_BCEID'].organization

        vehicle = Vehicle.objects.filter(organization=org1).first()

        if vehicle:
            # have to reset the status first to draft
            vehicle.validation_status = 'DRAFT'
            vehicle.save()

            response = self.clients['RTAN_BCEID'].patch(
                "/api/vehicles/{}/state_change".format(vehicle.id),
                content_type='application/json',
                data=json.dumps({'validation_status': "SUBMITTED"})
            )
            self.assertEqual(response.status_code, 200)

            response = self.clients['RTAN_BCEID'].get("/api/vehicles")
            self.assertEqual(response.status_code, 200)

            response = self.clients['RTAN_BCEID'].patch(
                "/api/vehicles/{}/state_change".format(vehicle.id),
                content_type='application/json',
                data=json.dumps({'validation_status': "VALIDATED"})
            )
            self.assertEqual(response.status_code, 403)

            response = self.clients['RTAN'].patch(
                "/api/vehicles/{}/state_change".format(vehicle.id),
                content_type='application/json',
                data=json.dumps({'validation_status': "VALIDATED"})
            )
            self.assertEqual(response.status_code, 200)

            response = self.clients['RTAN_BCEID'].get(
                "/api/vehicles/{}".format(vehicle.id)
            )
            self.assertEqual(response.status_code, 200)

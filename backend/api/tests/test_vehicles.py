import json

from .base_test_case import BaseTestCase
from ..models.vehicle import Vehicle
from ..models.user_role import UserRole
from ..models.role import Role
from unittest.mock import patch


class TestVehicles(BaseTestCase):
    def test_get_vehicles(self):
        UserRole.objects.create(
            user_profile_id=self.users['RTAN_BCEID'].id,
            role=Role.objects.get(
                role_code='ZEVA User',
            )
        )
        
        response = self.clients['RTAN_BCEID'].get("/api/vehicles")
        self.assertEqual(response.status_code, 200)

    def test_update_vehicle_state(self):
        UserRole.objects.create(
            user_profile_id=self.users['RTAN_BCEID'].id,
            role=Role.objects.get(
                role_code='Signing Authority',
            )
        )
        UserRole.objects.create(
            user_profile_id=self.users['RTAN_BCEID'].id,
            role=Role.objects.get(
                role_code='ZEVA User',
            )
        )
        org1 = self.users['RTAN_BCEID'].organization

        vehicle = Vehicle.objects.filter(organization=org1).first()

        if vehicle:
            # have to reset the status first to draft
            vehicle.validation_status = 'DRAFT'
            vehicle.save()

            with patch('api.services.send_email.send_zev_model_emails') as mock_send_zev_model_emails:
                response = self.clients['RTAN_BCEID'].patch(
                    "/api/vehicles/{}/state_change".format(vehicle.id),
                    content_type='application/json',
                    data=json.dumps({'validation_status': "SUBMITTED"})
                )
                self.assertEqual(response.status_code, 200)
                # Test that email method is called properly
                mock_send_zev_model_emails.assert_called()

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

    def test_create_vehicle(self):
        organization = self.users['RTAN_BCEID'].organization            
        response = self.clients['RTAN_BCEID'].post(
            "/api/vehicles",
            content_type='application/json',
            data=json.dumps({
                'make': "Teddy's Car Company",
                'model_name': "Fastcar1",
                'model_year': "2020",
                'vehicle_class_code': "L",
                'range' : 200,
                'weight_kg': 1000,
                'vehicle_zev_type': 'PHEV'
                })
        )
        self.assertEqual(response.status_code, 201)

    def test_create_vehicle_insufficient_data(self):
        organization = self.users['RTAN_BCEID'].organization            
        response = self.clients['RTAN_BCEID'].post(
            "/api/vehicles",
            content_type='application/json',
            data=json.dumps({
                'make': "Teddy's Car Company",
                'range': 200,
                'weight_kg': 1000,
                'vehicle_zev_type': 'PHEV'
                })
        )
        self.assertEqual(response.status_code, 400)

    def test_create_vehicle_check_data_match(self):
        organization = self.users['RTAN_BCEID'].organization            
        response = self.clients['RTAN_BCEID'].post(
            "/api/vehicles",
            content_type='application/json',
            data=json.dumps({
                'make': "Teddys Car Company",
                'model_name': "Fastcar1",
                'model_year': "2020",
                'vehicle_class_code': "L",
                'range': 200,
                'weight_kg': 1000,
                'vehicle_zev_type': 'PHEV'
                })
        )
        self.assertEqual(response.status_code, 201)
        car = Vehicle.objects.filter(
            make="TEDDYS CAR COMPANY",
            model_name="Fastcar1",
            model_year__name="2020",
            vehicle_class_code__vehicle_class_code="L",
            range=200,
            weight_kg=1000,
            vehicle_zev_type__vehicle_zev_code="PHEV"
        )
        self.assertGreaterEqual(len(car), 1)

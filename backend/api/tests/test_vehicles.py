import json

from .base_test_case import BaseTestCase
from ..models.vehicle import Vehicle
from ..models.user_role import UserRole
from ..models.role import Role
from ..models.model_year import ModelYear
from ..models.vehicle_zev_type import ZevType
from ..models.vehicle_class import VehicleClass
from unittest.mock import patch
from django.db.models import Q
from django.urls import reverse


class TestVehicles(BaseTestCase):
    def setUp(self):
        super().setUp()
        UserRole.objects.create(
            user_profile_id=self.users['RTAN_BCEID'].id,
            role=Role.objects.get(
                role_code='ZEVA User',
            )
        )
        UserRole.objects.create(
            user_profile_id=self.users['RTAN_BCEID'].id,
            role=Role.objects.get(
                role_code='Signing Authority',
            )
        )
        self.org1 = self.users['RTAN_BCEID'].organization
        my_2023 = ModelYear.objects.get(
            name='2023'
        )
        self.vehicle = Vehicle.objects.create(
            make="Test Manufacturer",
            model_name="Test Vehicle",
            model_year=my_2023,
            weight_kg=1000,
            vehicle_zev_type=ZevType.objects.all().first(),
            organization=self.org1,
            range=200,
            vehicle_class_code=VehicleClass.objects.all().first(),
            validation_status='DRAFT'
        )
    def test_get_vehicles(self):
        response = self.clients['RTAN_BCEID'].get("/api/vehicles")
        filtered_vehicles = Vehicle.objects.filter(
            organization=self.org1
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), filtered_vehicles.count())

    def test_idir_get_vehicles(self):
        response = self.clients['RTAN'].get("/api/vehicles")
        filtered_vehicles = Vehicle.objects.exclude(
            Q(validation_status="DRAFT") | Q(validation_status="DELETED")
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), filtered_vehicles.count())

    def test_update_vehicle_state(self):
        vehicle = Vehicle.objects.filter(organization=self.org1).first()
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
            #bceid can get a list of vehicles
            response = self.clients['RTAN_BCEID'].get("/api/vehicles")
            self.assertEqual(response.status_code, 200)
            #bceid cannot change the status of a vehicle
            response = self.clients['RTAN_BCEID'].patch(
                "/api/vehicles/{}/state_change".format(vehicle.id),
                content_type='application/json',
                data=json.dumps({'validation_status': "VALIDATED"})
            )
            self.assertEqual(response.status_code, 403)
            
            #idir user can change the status of a vehicle
            response = self.clients['RTAN'].patch(
                "/api/vehicles/{}/state_change".format(vehicle.id),
                content_type='application/json',
                data=json.dumps({'validation_status': "VALIDATED"})
            )
            self.assertEqual(response.status_code, 200)
            #bceid user can get the details of a vehicle
            response = self.clients['RTAN_BCEID'].get(
                "/api/vehicles/{}".format(vehicle.id)
            )
            self.assertEqual(response.status_code, 200)

    def test_create_vehicle(self):
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

    def test_zev_types(self):
        response = self.clients['RTAN_BCEID'].get(reverse('vehicle-zev-types'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)

    def test_vehicle_classes(self):
        response = self.clients['RTAN_BCEID'].get(reverse('vehicle-classes'))
        filtered_classes = VehicleClass.objects.all()
        self.assertEqual(response.status_code, 200)
        self.assertEquals(filtered_classes.count(), len(response.data))

    def test_vehicle_years(self):
        response = self.clients['RTAN_BCEID'].get(reverse('vehicle-years'))
        filtered_years = ModelYear.objects.all().exclude(name__in=['2017', '2018'])
        self.assertEqual(response.status_code, 200)
        self.assertEquals(filtered_years.count(), len(response.data))
    
    def test_minio_url(self):
        response = self.clients['RTAN_BCEID'].get(
            reverse('vehicle-minio-url', kwargs={'pk': self.vehicle.id})
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('url', response.data)
        self.assertIn('minio_object_name', response.data)

    def test_is_active_change(self):
        response = self.clients['RTAN_BCEID'].patch(
            reverse('vehicle-is-active-change', kwargs={'pk': self.vehicle.id}),
            content_type='application/json',
            data=json.dumps({'is_active': False})
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Vehicle.objects.get(pk=self.vehicle.id).is_active)
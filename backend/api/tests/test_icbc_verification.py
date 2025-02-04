from unittest.mock import patch, MagicMock
from api.models.icbc_upload_date import IcbcUploadDate
from api.tests.base_test_case import BaseTestCase
from api.models.icbc_upload_date import IcbcUploadDate
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from ..models.organization import Organization
import json


class IcbcVerificationViewSetTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        organizations = Organization.objects.filter(
            is_government=False,
            is_active=True
        )
        self.user1  = self.users['RTAN_BCEID']
        self.org1 = self.users[self.user1.username].organization
        self.date_uri = "/api/icbc-verification/date" 
        self.chunk_uri = "/api/icbc-verification/chunk_upload"
        self.upload_uri = "/api/icbc-verification/upload"
        filtered_organizations = [org for org in organizations if org != self.org1]

    @patch("api.models.icbc_upload_date.IcbcUploadDate.objects.last")
    def test_get_date(self, mock_last):
        """Tests if date endpoint returns last upload date."""
        mock_icbc = IcbcUploadDate(upload_date="2024-12-01", filename="test.csv")
        mock_last.return_value = mock_icbc
        response = self.clients[self.user1.username].get(self.date_uri)

        self.assertEqual(response.data["upload_date"], "2024-12-01")  
        self.assertEqual(response.status_code, 200)

    def test_forbidden_chunk_upload(self):
        """Tests if chunk_upload endpoint returns 403 if the user is not a government user."""
        with patch.object(type(self.user1), "is_government", False):
            response = self.clients[self.user1.username].post(self.chunk_uri)
        self.assertEqual(response.status_code, 403)

    # need to mock the rename from chunk upload method otherwise there will be a file error
    @patch("os.rename")  
    def test_chunk_upload_success(self, mock_rename):
        """Tests if chunk_upload allows a government user to upload."""
        with patch.object(type(self.user1), "is_government", True):  
            fake_file = SimpleUploadedFile("test.csv", b"fake file content")  

            response = self.clients[self.user1.username].post(
                self.chunk_uri,
                {"files": fake_file},
                format="multipart",  
            )

        self.assertEqual(response.status_code, 201)
        mock_rename.assert_called_once()  

    @patch("api.viewsets.icbc_verification.minio_remove_object")
    @patch("api.viewsets.icbc_verification.ingest_icbc_spreadsheet")
    @patch("api.viewsets.icbc_verification.get_minio_object")
    @patch("api.models.icbc_upload_date.IcbcUploadDate.objects")
    def test_upload_success(self, mock_icbc_objects, mock_get_minio, mock_ingest, mock_remove):
        """
        Tests that the upload endpoint processes a valid upload from a government user.
        """
        with patch.object(type(self.user1), "is_government", True):
            fake_upload_date = MagicMock()
            fake_upload_date.filename = "previous_file.xlsx"
            fake_upload_date.upload_date = "2024-12-31"
            fake_queryset = MagicMock()
            fake_queryset.latest.return_value = fake_upload_date
            mock_icbc_objects.exclude.return_value = fake_queryset

            fake_previous_file = MagicMock()
            fake_previous_file.close = MagicMock()
            fake_previous_file.release_conn = MagicMock()

            fake_current_file = MagicMock()
            fake_current_file.close = MagicMock()
            fake_current_file.release_conn = MagicMock()

            mock_get_minio.side_effect = [fake_previous_file, fake_current_file]

            mock_ingest.return_value = (True, 10, 3)

            data = {
                "filename": "current_file.xlsx",
                "submission_current_date": "2025-01-31"
            }

            response = self.clients[self.user1.username].post(
                self.upload_uri,
                data,
                format="json"
            )

            self.assertEqual(response.status_code, 201)

            response_data = json.loads(response.content)
            expected = {
                "dateCurrentTo": data["submission_current_date"],
                "createdRecords": 10,
                "updatedRecords": 3,
            }
            self.assertEqual(response_data, expected)

            mock_get_minio.assert_any_call("previous_file.xlsx")
            mock_get_minio.assert_any_call("current_file.xlsx")

            mock_ingest.assert_called_once_with(
                fake_current_file,
                "current_file.xlsx",
                self.user1,
                data["submission_current_date"],
                fake_previous_file
            )

            mock_remove.assert_called_once_with("previous_file.xlsx")

            fake_previous_file.close.assert_called_once()
            fake_previous_file.release_conn.assert_called_once()
            fake_current_file.close.assert_called_once()
            fake_current_file.release_conn.assert_called_once()

    def test_upload_forbidden(self):
        """Tests that the upload endpoint returns 403 when the user is not a government user."""
        with patch.object(type(self.user1), "is_government", False):
            data = {
                "filename": "current_file.xlsx",
                "submission_current_date": "2025-01-31"
            }
            response = self.clients[self.user1.username].post(
                self.upload_uri,
                data,
                format="json"
            )
        self.assertEqual(response.status_code, 403)

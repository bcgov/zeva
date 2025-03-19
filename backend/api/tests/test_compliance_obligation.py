import json
from django.urls import reverse
from unittest.mock import patch, MagicMock, PropertyMock
from api.tests.base_test_case import BaseTestCase
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report_compliance_obligation import ModelYearReportComplianceObligation
from api.models.model_year_report_confirmation import ModelYearReportConfirmation
from api.models.model_year_report_ldv_sales import ModelYearReportLDVSales
from api.models.signing_authority_assertion import SigningAuthorityAssertion


class ModelYearReportComplianceObligationViewsetTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.user1 = self.users['RTAN_BCEID']
        self.user1.title = "Test Title"
        self.user1.save()

    def test_create_compliance_obligation_success(self):
        """
        Tests the successful creation of a compliance obligation.
        """
        model_year, _ = ModelYear.objects.get_or_create(name="2025")
        
        report = ModelYearReport.objects.create(
            organization=self.user1.organization,
            model_year_id=model_year.id,
            credit_reduction_selection=""  
        )
        
        assertion1 = SigningAuthorityAssertion.objects.create(
            module="compliance_obligation",
            display_order=1
        )
        assertion2 = SigningAuthorityAssertion.objects.create(
            module="compliance_obligation",
            display_order=2
        )
        
        payload = {
            "report_id": report.id,
            "credit_activity": [
                {"category": "Test Category", "year": "2025", "a": 100, "b": 50}
            ],
            "confirmations": [assertion1.id, assertion2.id],
            "sales": 200,
            "credit_reduction_selection": "T"  
        }
        
        response = self.clients[self.user1.username].post(
            reverse("compliance-obligation-activity-list"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, report.id)
        
        ldv_sales = ModelYearReportLDVSales.objects.filter(
            model_year_report_id=report.id
        ).first()
        self.assertIsNotNone(ldv_sales)
        self.assertEqual(ldv_sales.ldv_sales, 200)
        self.assertFalse(ldv_sales.from_gov)
        self.assertEqual(ldv_sales.create_user, self.user1.username)
        self.assertEqual(ldv_sales.update_user, self.user1.username)
        
        confirmations = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=report.id
        )
        self.assertEqual(confirmations.count(), 2)
        for conf in confirmations:
            self.assertTrue(conf.has_accepted)
            self.assertEqual(conf.create_user, self.user1.username)
            self.assertEqual(conf.title, self.user1.title)
        
        obligations = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=report.id
        )
        self.assertEqual(obligations.count(), 1)
        obligation = obligations.first()
        self.assertEqual(obligation.category, "Test Category")
        self.assertEqual(obligation.credit_a_value, 100)
        self.assertEqual(obligation.credit_b_value, 50)
        self.assertEqual(obligation.model_year.id, model_year.id)
        
        # Verify that the report's credit_reduction_selection field was updated.
        report.refresh_from_db()
        self.assertEqual(report.credit_reduction_selection, "T")

    def test_update_obligation_success(self):
        """
        Ensure the update obligation end point can update appropriately with the payload.
        """
        model_year, _ = ModelYear.objects.get_or_create(name="2025")
        
        report = ModelYearReport.objects.create(
            organization=self.user1.organization,
            model_year_id=model_year.id
        )
        
        ModelYearReportComplianceObligation.objects.create(
            model_year_report_id=report.id,
            model_year=model_year,
            category="Old Category",
            credit_a_value=100,
            credit_b_value=50,
            from_gov=True
        )
        
        payload = {
            "credit_activity": [
                {"category": "Updated Category", "year": "2025", "a": 150, "b": 75, "reduction_value": 10}
            ]
        }
        
        update_url = reverse("compliance-obligation-activity-update-obligation", kwargs={'pk': report.id})
        
        response = self.clients[self.user1.username].patch(
            update_url,
            data=json.dumps(payload),
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.content.decode(), "Record Updated")
        
        obligations = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=report.id,
            from_gov=True
        )
        self.assertEqual(obligations.count(), 1)
        new_obligation = obligations.first()
        self.assertEqual(new_obligation.category, "Updated Category")
        self.assertEqual(new_obligation.credit_a_value, 150)
        self.assertEqual(new_obligation.credit_b_value, 75)
        self.assertEqual(new_obligation.reduction_value, 10)
        self.assertEqual(new_obligation.model_year, model_year)

    @patch("api.viewsets.model_year_report_compliance_obligation.get_reassessment_credit_activity")
    @patch("api.viewsets.model_year_report_compliance_obligation.ModelYearReportSupplementalCreditActivitySerializer")
    def test_reassessment_credit_activity(self, mock_serializer_class, mock_get_reassessment):
        """
        Test that the get for credit activity returns serialized data correctly.
        """
        dummy_credit_activity = [{"id": 1, "value": 100}]
        mock_get_reassessment.return_value = dummy_credit_activity

        dummy_serialized_data = [{"id": 1, "value": 100, "transformed": "example"}]
        serializer_instance = MagicMock()
        serializer_instance.data = dummy_serialized_data
        mock_serializer_class.return_value = serializer_instance

        url = reverse("compliance-obligation-activity-reassessment-credit-activity", kwargs={"pk": 1})

        response = self.clients[self.user1.username].get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, dummy_serialized_data)

        mock_get_reassessment.assert_called_once_with("1", "PreviousReassessmentEndingBalance")

        mock_serializer_class.assert_called_once_with(dummy_credit_activity, many=True)

    @patch("api.viewsets.model_year_report_compliance_obligation.get_most_recent_ldv_sales")
    @patch("api.viewsets.model_year_report_compliance_obligation.ModelYearReportComplianceObligationSnapshotSerializer")
    def test_details_success(self, mock_snapshot_serializer, mock_get_most_recent_ldv_sales):
        """
        Test the gett dails endpoint returns a 201 with the expected data.
        """
        model_year, _ = ModelYear.objects.get_or_create(name="2025")
        report = ModelYearReport.objects.create(
            organization=self.user1.organization,
            model_year_id=model_year.id,
            credit_reduction_selection=""
        )
        report.validation_status = ModelYearReportStatuses.ASSESSED
        report.save()

        with patch.object(ModelYearReport, 'ldv_sales', new_callable=PropertyMock) as mock_ldv_sales:
            mock_ldv_sales.return_value = "test_ldv_sales"

            dummy_data = [{"foo": "bar"}]
            serializer_instance = MagicMock()
            serializer_instance.data = dummy_data
            mock_snapshot_serializer.return_value = serializer_instance

            mock_get_most_recent_ldv_sales.return_value = "unused"

            url = reverse("compliance-obligation-activity-details", kwargs={"pk": report.id})

            with patch("api.models.user_profile.UserProfile.has_perm", return_value=True):
                response = self.clients[self.user1.username].get(url)

            expected = {
                "compliance_obligation": dummy_data,
                "compliance_offset": None,
                "ldv_sales": "test_ldv_sales",
            }

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data, expected)

    def test_unauth(self):
        """
        Send request where the user does not have the appropriate permissions.
        """
        model_year, _ = ModelYear.objects.get_or_create(name="2025")
        report = ModelYearReport.objects.create(
            organization=self.user1.organization,
            model_year_id=model_year.id,
            credit_reduction_selection=""
        )
        self.assertNotEqual(report.id, self.user1.id)
        
        url = reverse("compliance-obligation-activity-details", kwargs={"pk": report.id})
        
        with patch("api.models.user_profile.UserProfile.has_perm", return_value=False):
            response = self.clients[self.user1.username].get(url)
        
        self.assertEqual(response.status_code, 403)

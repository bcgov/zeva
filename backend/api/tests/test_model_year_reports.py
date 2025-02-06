from email import header
import json
from django.utils.datetime_safe import datetime
from rest_framework.serializers import ValidationError

from .base_test_case import BaseTestCase
from ..models.model_year_report import ModelYearReport
from ..models.model_year_report_compliance_obligation import ModelYearReportComplianceObligation
from ..models.supplemental_report import SupplementalReport
from ..models.model_year_report_statuses import ModelYearReportStatuses
from ..models.model_year_report_assessment import ModelYearReportAssessment
from ..models.model_year_report_assessment_descriptions import ModelYearReportAssessmentDescriptions
from ..models.model_year_report_ldv_sales import ModelYearReportLDVSales
from ..models.organization import Organization
from ..models.model_year import ModelYear
from unittest.mock import patch, MagicMock

from api.models import model_year

CONTENT_TYPE = 'application/json'

class TestModelYearReports(BaseTestCase):
    def setUp(self):
        super().setUp()

        org1 = self.users['EMHILLIE_BCEID'].organization
        gov = self.users['RTAN'].organization

        model_year_report = ModelYearReport.objects.create(
            id=1,
            organization=org1,
            create_user='EMHILLIE_BCEID',
            validation_status=ModelYearReportStatuses.ASSESSED,
            organization_name=Organization.objects.get(name='BMW Canada Inc.'),
            supplier_class='M',
            model_year=ModelYear.objects.get(effective_date='2021-01-01'),
            credit_reduction_selection='A'
        )

        self.report = model_year_report

        supplementary_report = SupplementalReport.objects.create(
            model_year_report=model_year_report,
            create_user='EMHILLIE_BCEID',
            status=ModelYearReportStatuses.DRAFT,
        )

        model_year_report_assessment_description = ModelYearReportAssessmentDescriptions.objects.create(
          description='test',
          display_order=1
        )

        model_year_report_assessment = ModelYearReportAssessment.objects.create(
            model_year_report=model_year_report,
            model_year_report_assessment_description=model_year_report_assessment_description,
            penalty=20.00
        )

        reassessment_report = SupplementalReport.objects.create(
            model_year_report=model_year_report,
            supplemental_id=supplementary_report.id,
            create_user='RTAN',
            status=ModelYearReportStatuses.DRAFT,
        )

        ModelYearReportComplianceObligation.objects.create(
            model_year_report=model_year_report,
            model_year = ModelYear.objects.get(effective_date='2021-01-01'),
            category='ClassAReduction',
            credit_a_value=100.00,
            credit_b_value=50.00,
            reduction_value=10.00,
            from_gov=False
        )

        ModelYearReportComplianceObligation.objects.create(
            model_year_report=model_year_report,
            model_year = ModelYear.objects.get(effective_date='2021-01-01'),
            category='CreditDeficit',
            credit_a_value=200.00,
            credit_b_value=100.00,
            reduction_value=20.00,
            from_gov=True
        )

        ModelYearReportComplianceObligation.objects.create(
            model_year_report=model_year_report,
            model_year = ModelYear.objects.get(effective_date='2021-01-01'),
            category='UnrelatedCategory',  # This should be filtered out
            credit_a_value=300.00,
            credit_b_value=150.00,
            reduction_value=30.00,
            from_gov=False
        )

        self.ldv_sales = ModelYearReportLDVSales.objects.create(
                model_year=model_year_report.model_year,
                model_year_report=model_year_report,
                ldv_sales=100,
                from_gov=False
        )

    def test_status(self):
        response = self.clients['EMHILLIE_BCEID'].get("/api/compliance/reports")
        self.assertEqual(response.status_code, 200)
        result = response.data
        self.assertEqual(len(result), 1)

    def test_get_ldv_sales_with_year_success(self):
        result = self.report.get_ldv_sales_with_year()
        self.assertIsNotNone(result)
        self.assertEqual(result['sales'], 100)
        self.assertEqual(result['year'], '2021')

    def test_get_ldv_sales_with_year_no_match(self):
        result = self.report.get_ldv_sales_with_year(from_gov=True)
        self.assertIsNone(result)

    def test_get_ldv_sales_with_year_gov_record(self):
        ModelYearReportLDVSales.objects.create(
            model_year = ModelYear.objects.get(effective_date='2021-01-01'),
            model_year_report=self.report,
            from_gov=True,
            display=True,
            ldv_sales=165
        )
        result = self.report.get_ldv_sales_with_year(from_gov=True)
        self.assertIsNotNone(result)
        self.assertEqual(result['sales'], 165)
        self.assertEqual(result['year'], '2021')


    def test_assessment_patch_response(self):
        with patch('api.services.send_email.send_model_year_report_emails') as mock_send_model_year_report_emails:
        
            makes = ["TESLATRUCK", "TESLA", "TEST"]
            sales = {"2020":25}
            data = json.dumps({"makes":makes, "sales":sales})

            response = self.clients['RTAN'].patch("/api/compliance/reports/1/assessment_patch", data=data, content_type=CONTENT_TYPE)
            self.assertEqual(response.status_code, 200)

            response = self.clients['RTAN'].patch("/api/compliance/reports/999/assessment_patch", data=data, content_type=CONTENT_TYPE)
            self.assertEqual(response.status_code, 404)

            data = json.dumps({"makes":makes, "sales":sales, "validation_status": 'SUBMITTED'})

            response = self.clients['RTAN'].patch("/api/compliance/reports/1/assessment_patch", data=data, content_type=CONTENT_TYPE)
            self.assertEqual(response.status_code, 200)


    def test_assessment_patch_logic(self):
        makes = ["TESLATRUCK", "TESLA", "TEST"]
        sales = {"2020":25}
        model_year = ModelYear.objects.filter(id=2).first()
        model_year_report = ModelYearReport.objects.filter(id=1).first()
        data = json.dumps({"makes":makes, "sales":sales})

        # TEMPORARY FIX FOR PIPELINE, RENABLED ONCE PIPELINE ISSUES RESOLVED
        # modelYearReportLDVSales1 = ModelYearReportLDVSales.objects.create(
        #     model_year=model_year,
        #     ldv_sales=10,
        #     model_year_report=model_year_report
        # )

        # response = self.clients['RTAN'].patch("/api/compliance/reports/1/assessment_patch", data=data, content_type=CONTENT_TYPE)

        # sales_records = ModelYearReportLDVSales.objects.filter(
        #     model_year_id=model_year.id,
        #     model_year_report=model_year_report)

        # # Check that second record is created
        # self.assertEqual(sales_records.count(), 1)

        # data = json.dumps({"makes":makes, "sales":{"2020":10}})
        # response = self.clients['RTAN'].patch("/api/compliance/reports/1/assessment_patch", data=data, content_type=CONTENT_TYPE)
        
        # sales_records = ModelYearReportLDVSales.objects.filter(
        #     model_year_id=model_year.id,
        #     model_year_report=model_year_report)
        
        # # Check for proper deletion of first record
        # self.assertEqual(sales_records.count(), 1)

        # modelYearReportLDVSales2 = ModelYearReportLDVSales.objects.create(
        #     model_year=model_year,
        #     ldv_sales=10,
        #     from_gov=True,
        #     model_year_report=model_year_report
        # )
        
        # data = json.dumps({"makes":makes, "sales":{"2020":50}})
        # response = self.clients['RTAN'].patch("/api/compliance/reports/1/assessment_patch", data=data, content_type=CONTENT_TYPE)

        # sales_records = ModelYearReportLDVSales.objects.filter(
        #     model_year_id=model_year.id,
        #     model_year_report=model_year_report)
        
        # sales_record = ModelYearReportLDVSales.objects.filter(id=3).first()

        # # check that second record is updated, and no new record created
        # self.assertEqual(sales_records.count(), 2)
        # self.assertEqual(sales_record.ldv_sales, 50)

    
    def test_get_avg_sales_with_organization_sales(self):
        self.report.organization.get_avg_ldv_sales = MagicMock(return_value=300)

        result = self.report.get_avg_sales()
        self.assertEqual(result, 300)

    def test_get_avg_sales_without_any_sales_data(self):
        self.report.organization.get_avg_ldv_sales = MagicMock(return_value=None)
        ModelYearReportLDVSales.objects.all().delete()

        result = self.report.get_avg_sales()
        self.assertIsNone(result)

    def test_get_avg_sales_with_multiple_report_sales(self):
        self.report.organization.get_avg_ldv_sales = MagicMock(return_value=None)

        ModelYearReportLDVSales.objects.create(
            model_year_report=self.report,
            model_year=ModelYear.objects.get(effective_date='2021-01-01'),
            display=True,
            ldv_sales=400,
            update_timestamp="2023-01-01 10:00:00"
        )

        latest_sales = ModelYearReportLDVSales.objects.create(
            model_year_report=self.report,
            model_year=ModelYear.objects.get(effective_date='2021-01-01'),
            display=True,
            ldv_sales=600,
            update_timestamp="2023-02-01 10:00:00"
        )

        result = self.report.get_avg_sales()
        self.assertEqual(result, latest_sales.ldv_sales)

    def test_get_credit_reductions(self):
        results = self.report.get_credit_reductions()

        self.assertEqual(results.count(), 2) 
        categories = [entry.category for entry in results]
        self.assertIn('ClassAReduction', categories)
        self.assertIn('CreditDeficit', categories)
        self.assertNotIn('SomeOtherCategory', categories)

    def test_get_credit_reductions_without_matching_categories(self):
        ModelYearReportComplianceObligation.objects.all().delete()

        ModelYearReportComplianceObligation.objects.create(
            model_year_report=self.report,
            model_year=ModelYear.objects.get(effective_date='2021-01-01'),
            category='NonMatchingCategory',
            credit_a_value=200.00,
            credit_b_value=100.00
        )

        reductions = self.report.get_credit_reductions()

        self.assertIsNone(reductions)


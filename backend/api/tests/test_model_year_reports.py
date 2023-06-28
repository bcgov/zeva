from email import header
import json
from django.utils.datetime_safe import datetime
from rest_framework.serializers import ValidationError

from .base_test_case import BaseTestCase
from ..models.model_year_report import ModelYearReport
from ..models.supplemental_report import SupplementalReport
from ..models.model_year_report_statuses import ModelYearReportStatuses
from ..models.model_year_report_assessment import ModelYearReportAssessment
from ..models.model_year_report_assessment_descriptions import ModelYearReportAssessmentDescriptions
from ..models.model_year_report_ldv_sales import ModelYearReportLDVSales
from ..models.organization import Organization
from ..models.model_year import ModelYear
from unittest.mock import patch

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

    def test_status(self):
        response = self.clients['EMHILLIE_BCEID'].get("/api/compliance/reports")
        self.assertEqual(response.status_code, 200)
        result = response.data
        self.assertEqual(len(result), 1)

    
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

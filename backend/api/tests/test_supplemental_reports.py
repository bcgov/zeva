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
from ..models.organization_deficits import OrganizationDeficits

SAVE_API = '/api/compliance/reports/1/supplemental_save'
CONTENT_TYPE = 'application/json'

class TestSupplementalReports(BaseTestCase):
    def setUp(self):
        super().setUp()

        org1 = self.users['EMHILLIE_BCEID'].organization

        self.model_year_report = ModelYearReport.objects.create(
            id=1,
            organization=org1,
            create_user='EMHILLIE_BCEID',
            validation_status=ModelYearReportStatuses.ASSESSED,
            organization_name=Organization.objects.get(name='BMW Canada Inc.'),
            supplier_class='M',
            model_year=ModelYear.objects.get(effective_date='2021-01-01'),
            credit_reduction_selection='A'
        )
        self.supplementary_report = SupplementalReport.objects.create(
            model_year_report=self.model_year_report,
            create_user='EMHILLIE_BCEID',
            status=ModelYearReportStatuses.DRAFT,
        )
        model_year_report_assessment_description = ModelYearReportAssessmentDescriptions.objects.create(
          description='test',
          display_order=1
        )
        self.description_id = model_year_report_assessment_description.id

    def test_supplemental_patch(self):
        data = json.dumps({
          "newReport": False,
          "creditActivity": [
            {
              "category": "ProvisionalBalanceAfterCreditReduction",
              "creditAValue": 0,
              "creditBValue": 0,
              "modelYear": 2019
            }
          ],
          "deleteFiles": [],
          "description": self.description_id,
          "evidenceAttachments": {},
          "fromSupplierComment": "",
          "supplierInfo": {
            "ldvSales": 1000
          },
          "status": "DRAFT",
          "zevSales": []
        })
        self.clients['RTAN'].patch(SAVE_API, data=data, content_type=CONTENT_TYPE)
        report = SupplementalReport.objects.last()
        self.assertEqual(report.ldv_sales, 1000)


    def test_reassessment_create(self):
        data = json.dumps({
          "newReport": True,
          "creditActivity": [
            {
              "category": "ProvisionalBalanceAfterCreditReduction",
              "creditAValue": 0,
              "creditBValue": 0,
              "modelYear": 2019
            }
          ],
          "deleteFiles": [],
          "description": self.description_id,
          "evidenceAttachments": {},
          "fromSupplierComment": "",
          "penalty": 23,
          "status": "DRAFT",
          "supplierInfo": {
            "ldvSales": 2500
          },
          "zevSales": []
        })
        self.clients['RTAN'].patch(SAVE_API, data=data, content_type=CONTENT_TYPE)
        supplemental_reports = SupplementalReport.objects.all()
        self.assertEqual(supplemental_reports.count(), 2)
        most_recent_report = SupplementalReport.objects.last()
        self.assertEqual(most_recent_report.ldv_sales, 2500)


    def test_reassessment_deficit(self):
        SupplementalReport.objects.create(
            model_year_report=self.model_year_report,
            create_user='RTAN',
            ldv_sales=200,
            status=ModelYearReportStatuses.DRAFT
        )
        data = json.dumps({
          "newReport": False,
          "creditActivity": [
            {
              "category": "ProvisionalBalanceAfterCreditReduction",
              "creditAValue": 0,
              "creditBValue": 0,
              "modelYear": 2019
            },
            {
              "category": "CreditDeficit",
              "creditAValue": 200,
              "creditBValue": 100,
              "modelYear": 2019
            },
          ],
          "deleteFiles": [],
          "description": self.description_id,
          "evidenceAttachments": {},
          "fromSupplierComment": "",
          "penalty": 23,
          "status": "DRAFT",
          "supplierInfo": {
            "ldvSales": 2500
          },
          "zevSales": []
        })
        self.clients['RTAN'].patch(SAVE_API, data=data, content_type=CONTENT_TYPE)

        data = json.dumps({
          "newReport": False,
          "status": "SUBMITTED"
        })
        self.clients['RTAN'].patch(SAVE_API, data=data, content_type=CONTENT_TYPE)

        report = SupplementalReport.objects.last()
        self.assertEqual(report.status, ModelYearReportStatuses.SUBMITTED)

        deficits = OrganizationDeficits.objects.all()
        self.assertEqual(deficits.count(), 0)

        data = json.dumps({
          "newReport": False,
          "status": "ASSESSED"
        })
        self.clients['RTAN'].patch(SAVE_API, data=data, content_type=CONTENT_TYPE)

        deficits = OrganizationDeficits.objects.all()
        self.assertEqual(deficits.count(), 2)
        self.assertEqual(deficits[0].credit_class_id, 1)
        self.assertEqual(deficits[0].credit_value, 200)
        self.assertEqual(deficits[1].credit_class_id, 2)
        self.assertEqual(deficits[1].credit_value, 100)

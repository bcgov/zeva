# from django.utils.datetime_safe import datetime
# from rest_framework.serializers import ValidationError

# from .base_test_case import BaseTestCase
# from ..models.model_year_report import ModelYearReport
# from ..models.supplemental_report import SupplementalReport
# from ..models.model_year_report_statuses import ModelYearReportStatuses
# from ..models.organization import Organization
# from ..models.model_year import ModelYear


# class TestModelYearReports(BaseTestCase):
#     def setUp(self):
#         super().setUp()

#         org1 = self.users['EMHILLIE_BCEID'].organization
#         gov = self.users['RTAN'].organization

#         model_year_report = ModelYearReport.objects.create(
#             organization=org1,
#             create_user='EMHILLIE_BCEID',
#             validation_status=ModelYearReportStatuses.ASSESSED,
#             organization_name=Organization.objects.get('BMW Canada Inc.'),
#             supplier_class='M',
#             model_year=ModelYear.objects.get('2021'),
#             credit_reduction_selection='A'
#         )
#         supplementary_report = SupplementalReport.objects.create(
#             create_user='EMHILLIE_BCEID',
#             validation_status=ModelYearReportStatuses.DRAFT,
#         )
#         reassessment_report = SupplementalReport.objects.create(
#             create_user='RTAN',
#             validation_status=ModelYearReportStatuses.DRAFT,
#         )

#     def test_status(self):
#         response = self.clients['EMHILLIE_BCEID'].get("/api/compliance/reports")
#         self.assertEqual(response.status_code, 200)
#         result = response.data
#         print('(((((((((())))))))))')
#         print(result)
#         print('(((((((((())))))))))')
#         # self.assertEqual(len(result), 1)

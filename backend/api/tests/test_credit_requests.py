from django.utils.datetime_safe import datetime
from rest_framework.serializers import ValidationError

from .base_test_case import BaseTestCase
from ..models.record_of_sale import RecordOfSale
from ..models.record_of_sale_statuses import RecordOfSaleStatuses
from ..models.sales_submission import SalesSubmission
from ..models.vehicle import Vehicle
from ..models.vin_statuses import VINStatuses
from ..models.sales_submission_statuses import SalesSubmissionStatuses
from ..models.organization import Organization
from ..models.sales_submission_comment import SalesSubmissionComment

class TestSales(BaseTestCase):
    def setUp(self):
        super().setUp()
        organizations = Organization.objects.filter(
            is_government=False,
            is_active=True
        )
        self.user  = self.users['RTAN_BCEID']
        filtered_organizations = [org for org in organizations if org != self.user.organization]
        self.other_organization = filtered_organizations[0]
        self.sub = SalesSubmission.objects.create(
            organization=self.user.organization,
        )
        self.other_org_sub = SalesSubmission.objects.create(
            organization=self.other_organization,
        )
        vehicle = Vehicle.objects.filter(organization=self.user.organization).first()

        if vehicle:
            ros = RecordOfSale(
                submission=self.sub,
                vin_validation_status=VINStatuses.UNCHECKED,
                vin='ABC123',
                validation_status=RecordOfSaleStatuses.DRAFT,
                sale_date=datetime.utcnow(),
                vehicle=vehicle
            )

            ros.save()
        self.other_comment = SalesSubmissionComment.objects.create(
            create_user="EMHILLIE",
            sales_submission=self.sub,
            to_govt=True,
            comment='test'
        )
        self.comment = SalesSubmissionComment.objects.create(
            create_user="RTAN",
            sales_submission=self.sub,
            to_govt=True,
            comment='test'
        )
    """bceid user can see the list of its own sales"""
    def test_list_sales_fs(self):
        response = self.clients['RTAN_BCEID'].get("/api/credit-requests")
        self.assertEqual(response.status_code, 200)
    """Idir user lists sales"""
    def test_list_sales_gov(self):
        response = self.clients['RTAN'].get("/api/credit-requests")
        self.assertEqual(response.status_code, 200)
    """organization can get the details of their own sale"""
    def test_get_submission_details_same_org(self):
        response = self.clients['RTAN_BCEID'].get("/api/credit-requests/{}".format(self.sub.id))
        self.assertEqual(response.status_code, 200)
    """Idir user cant see draft status submission"""
    def test_cant_get_draft_submission_details_idir(self):
        response = self.clients['RTAN'].get("/api/credit-requests/{}".format(self.sub.id))
        self.assertEqual(response.status_code, 404)
    """BCEID user can submit sales to change the status from draft to submited"""
    def test_submit_submission_bceid(self):
        response = self.clients['RTAN_BCEID'].patch("/api/credit-requests/{}".format(self.sub.id),
            {'validation_status':"SUBMITTED"}, content_type='application/json',
        )
        submission = SalesSubmission.objects.get(id=self.sub.id)
        self.assertEqual(response.status_code, 200)
        self.assertEquals(submission.validation_status, SalesSubmissionStatuses.SUBMITTED)
    """organization cannot submit another orgs submission"""
    def test_submit_other_org_submission(self):
        submission = SalesSubmission.objects.get(id=self.sub.id)
        response = self.clients['RTAN_BCEID'].patch("/api/credit-requests/{}".format(self.other_org_sub.id),
            {'validation_status':"SUBMITTED"}, content_type='application/json',
        )
        submission = SalesSubmission.objects.get(id=self.sub.id)
        self.assertEqual(response.status_code, 404)
        self.assertEquals(submission.validation_status, SalesSubmissionStatuses.DRAFT)
    """bceid user can paginate request list"""
    def test_get_paginated_submissions(self):
        response = self.clients['RTAN_BCEID'].post("/api/credit-requests/paginated",
            {'sorts':[{'id': "id", 'desc': "true"}], 'filters': []}, content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
    """a bceid user can download a record of sale template"""
    def test_get_record_of_sale_template(self):
        response = self.clients['RTAN_BCEID'].get("/api/credit-requests/template")
        self.assertEqual(response.status_code, 200)
    """user can edit comment that they wrote"""
    def test_update_own_comment(self):
        
        response = self.clients['RTAN'].patch("/api/credit-requests/{}/update_comment".format(self.comment.id),
            {'comment':"test edit", }, content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
    """user cannot edit comment that they didn't write"""
    def test_update_others_comment(self):

        response = self.clients['RTAN'].patch("/api/credit-requests/{}/update_comment".format(self.other_comment.id),
            {'comment':"test edit fail"}, content_type='application/json',
        )
        self.assertEqual(response.status_code, 403)
    """user can delete their own comment"""
    def test_delete_own_comment(self):
        response = self.clients['RTAN'].patch("/api/credit-requests/{}/delete_comment".format(self.comment.id),
        )
        self.assertEqual(response.status_code, 200)
    
    def test_delete_other_comment(self):
        response = self.clients['RTAN'].patch("/api/credit-requests/{}/delete_comment".format(self.other_comment.id),
        )
        self.assertEqual(response.status_code, 403)


    """some submission statuses can not be changed by bceid"""
    def test_validate_validation_status(self):
        sub = SalesSubmission.objects.create(
            organization=self.users['RTAN_BCEID'].organization,
            submission_sequence=1,
            validation_status=SalesSubmissionStatuses.NEW
        )

        request = {
            'user': self.users['RTAN_BCEID']
        }

        # try changing from status NEW to VALIDATED, this should fail
        # ie it should throw a Validation Error
        self.assertRaises(
            ValidationError, sub.validate_validation_status, SalesSubmissionStatuses.VALIDATED, request
        )

        sub.validation_status = SalesSubmissionStatuses.RECOMMEND_APPROVAL
        sub.save()

        # try changing from status RECOMMEND_APPROVAL to DELETED, this should
        # fail
        # ie it should throw a Validation Error
        self.assertRaises(
            ValidationError, sub.validate_validation_status, SalesSubmissionStatuses.DELETED, request
        )        

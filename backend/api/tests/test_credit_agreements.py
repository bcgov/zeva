import json
from rest_framework.serializers import ValidationError
from django.utils import timezone
from django.db import transaction
from api.services.minio import minio_put_object
from .base_test_case import BaseTestCase
from ..models.credit_agreement import CreditAgreement
from ..models.credit_class import CreditClass
from ..models.model_year import ModelYear
from ..models.weight_class import WeightClass
from ..models.credit_transaction_type import CreditTransactionType
from ..models.organization import Organization
from ..models.credit_agreement_statuses import CreditAgreementStatuses
from ..models.credit_agreement_comment import CreditAgreementComment
from ..models.credit_agreement_transaction_types import CreditAgreementTransactionTypes
from unittest.mock import patch
from rest_framework import status
from django.urls import reverse

class TestAgreements(BaseTestCase):
    def setUp(self):
        super().setUp()
        user = self.users['RTAN_BCEID']
        self.org = user.organization

        self.credit_agreement = CreditAgreement.objects.create(
            organization=self.org,
            transaction_type=CreditAgreementTransactionTypes.INITIATIVE_AGREEMENT,
            status=CreditAgreementStatuses.RECOMMENDED,
        )

        self.comment_bceid = CreditAgreementComment.objects.create(
           credit_agreement=self.credit_agreement,
           to_director=False,
           comment='test',
           create_user='RTAN'
        ) 
        
        self.comment_idir = CreditAgreementComment.objects.create(
           credit_agreement=self.credit_agreement,
           to_director=True,
           comment='test to director',
           create_user='test user'
        ) 

    def test_list_credit_agreements(self):
        response = self.clients['RTAN'].get('/api/credit-agreements')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ##idir should see all agreements except deleted
        idir_agreements= CreditAgreement.objects.exclude(
            status=CreditAgreementStatuses.DELETED
        )
        self.assertEqual(len(response.data), idir_agreements.count())

        bceid_response = self.clients['RTAN_BCEID'].get('/api/credit-agreements')
        self.assertEqual(bceid_response.status_code, status.HTTP_200_OK)
        ##bceid should see only agreements issued to their organization
        filtered_agreements = CreditAgreement.objects.filter(
            organization=self.org,
            status=CreditAgreementStatuses.ISSUED,
        )
        self.assertEqual(len(bceid_response.data), filtered_agreements.count())


    def test_comment_save(self):
        data = {
            'comment': 'New comment',
            'director': False,
        }
        response = self.clients['RTAN'].patch('/api/credit-agreements/{}/comment_save'
                                              .format(self.credit_agreement.id),
                                              data ,
                                              content_type='application/json',
                                              )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(CreditAgreementComment.objects.filter(comment='New comment').exists())

    def test_get_agreement_details(self):
        response_bceid = self.clients['RTAN_BCEID'].get('/api/credit-agreements/' + str(self.credit_agreement.id))
        #bceid users cannot see unissued agreements
        self.assertEqual(response_bceid.status_code, status.HTTP_404_NOT_FOUND)
        #idir users can get the details
        response_idir = self.clients['RTAN'].get('/api/credit-agreements/' + str(self.credit_agreement.id))
        self.assertEqual(response_idir.status_code, status.HTTP_200_OK)
        comments = response_idir.data['comments']
        self.assertEquals(len(comments), 2)

    def test_update_agreement_status(self):
        update_response = self.clients['RTAN'].patch(
            '/api/credit-agreements/{}'.format(self.credit_agreement.id),
            {'validationStatus': 'ISSUED'}, content_type='application/json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        #bceid users can see non director comments if the status is issued
        response_bceid = self.clients['RTAN_BCEID'].get(
            '/api/credit-agreements/' + str(self.credit_agreement.id))
        self.assertEqual(len(response_bceid.data['comments']), 
                        len(CreditAgreementComment.objects.filter(
                            to_director='False',
                            credit_agreement_id=self.credit_agreement.id)))


    def test_update_comment(self):
        ##idir can update their own comment
        data = {
            'comment_id': self.comment_bceid.id,
            'comment_text': 'Updated comment to bceid',
        }
        response = self.clients['RTAN'].patch(
            '/api/credit-agreements/{}/update_comment'
            .format(self.credit_agreement.id), data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment_bceid.refresh_from_db()
        self.assertEqual(self.comment_bceid.comment, 'Updated comment to bceid')

        ##idir cannot update someone elses comment
        data = {
            'comment_id': self.comment_idir.id,
            'comment_text': 'Updated comment to idir',
        }
        response = self.clients['RTAN'].patch(
            '/api/credit-agreements/{}/update_comment'
            .format(self.credit_agreement.id), data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.comment_bceid.refresh_from_db()
        self.assertNotEqual(self.comment_bceid.comment, 'Updated comment to idir')

        ##bceid cannot update a comment
        response = self.clients['RTAN_BCEID'].patch(
            '/api/credit-agreements/{}/update_comment'
            .format(self.credit_agreement.id), data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.comment_bceid.refresh_from_db()
        self.assertNotEqual(self.comment_bceid.comment, 'Updated comment to idir')

    def test_delete_comment(self):
        #idir user can delete their own comment
        data = {
            'comment_id': self.comment_bceid.id,
        }
        response = self.clients['RTAN'].patch('/api/credit-agreements/{}/delete_comment'.format(self.credit_agreement.id), data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(CreditAgreementComment.objects.filter(id=self.comment_bceid.id).exists())
        
        #idir cannot delete someone elses comment
        data = {
            'comment_id': self.comment_idir.id,
        }
        response = self.clients['RTAN'].patch(
            '/api/credit-agreements/{}/delete_comment'
            .format(self.credit_agreement.id),
            data, 
            content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(CreditAgreementComment.objects.filter(id=self.comment_idir.id).exists())

        #bceid cannot delete someone elses comment
        response = self.clients['RTAN_BCEID'].patch(
            '/api/credit-agreements/{}/delete_comment'
            .format(self.credit_agreement.id),
            data,
            content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(CreditAgreementComment.objects.filter(id=self.comment_idir.id).exists())

    def test_no_comments_on_agreement(self):
        CreditAgreementComment.objects.all().delete()
        response = self.clients['RTAN'].get('/api/credit-agreements/' + str(self.credit_agreement.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['comments'])

    def test_list_no_credit_agreements(self):
        CreditAgreementComment.objects.all().delete()
        CreditAgreement.objects.all().delete()
        response = self.clients['RTAN'].get('/api/credit-agreements')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_get_invalid_agreement(self):
        response = self.clients['RTAN'].get('/api/credit-agreements/testagreementdoesntexist')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_invalid_comment(self):
        data = {
            'comment_id': 999999,  # Nonexistent comment ID
            'comment_text': 'Should fail',
        }
        response = self.clients['RTAN'].patch(
            '/api/credit-agreements/{}/update_comment'
            .format(self.credit_agreement.id), data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch('api.viewsets.credit_agreement.minio_put_object')
    def test_minio_url(self, mock_minio_put_object):
        mock_minio_put_object.return_value = 'http://mocked-minio-url.com'

        response = self.clients['RTAN'].get(
            '/api/credit-agreements/{}/minio_url'.format(self.credit_agreement.id)
        )
        # Assert response status
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert the mocked URL is returned
        self.assertIn('url', response.data)
        self.assertEqual(response.data['url'], 'http://mocked-minio-url.com')
    
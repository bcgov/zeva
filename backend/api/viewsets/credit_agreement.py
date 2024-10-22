import uuid

from django.db.models import Q

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from api.models.credit_agreement import CreditAgreement
from api.models.credit_agreement_transaction_types import \
    CreditAgreementTransactionTypes
from api.models.credit_agreement_statuses import \
    CreditAgreementStatuses
from api.models.credit_agreement_comment import \
    CreditAgreementComment
from api.serializers.credit_agreement import CreditAgreementSerializer, \
    CreditAgreementListSerializer, CreditAgreementSaveSerializer
from api.services.minio import minio_put_object
from api.services.credit_agreement import adjust_credits
from auditable.views import AuditableCreateMixin, AuditableUpdateMixin
from api.models.credit_agreement_statuses import CreditAgreementStatuses
from api.services.send_email import notifications_credit_agreement
from api.models.model_year_report import ModelYearReport
from api.serializers.model_year_report import ModelYearReportsSerializer
from api.serializers.credit_agreement_comment import CreditAgreementCommentSerializer
from api.services.credit_agreement_comment import get_comment, delete_comment
from api.utilities.comment import update_comment_text
from api.permissions.same_organization import SameOrganizationPermissions


class CreditAgreementViewSet(
    viewsets.GenericViewSet,
    AuditableCreateMixin,
    AuditableUpdateMixin,
    mixins.RetrieveModelMixin,
):
    permission_classes = [SameOrganizationPermissions]
    same_org_permissions_context = {
        "default_manager": CreditAgreement.objects,
        "default_path_to_org": ("organization",),
        "actions_not_to_check": ["retrieve", "partial_update", "minio_url", "update_comment", "delete_comment"]
    }
    http_method_names = ['get', 'post', 'patch']
    serializer_classes = {
        'default': CreditAgreementSerializer,
        'create': CreditAgreementSaveSerializer,
        'partial_update': CreditAgreementSaveSerializer,
        'list': CreditAgreementListSerializer,
    }

    def get_queryset(self):
        request = self.request
        if request.user.is_government:
            queryset = CreditAgreement.objects.exclude(status__in=[
                CreditAgreementStatuses.DELETED,
            ])
        else:
            queryset = CreditAgreement.objects.filter(
                (Q(organization_id=request.user.organization.id) &
                    Q(status__in=[
                        CreditAgreementStatuses.ISSUED,
                        ]))
                )
        return queryset

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def perform_update(self, serializer, *args, **kwargs):
        agreement = serializer.save()
        if agreement.status == CreditAgreementStatuses.ISSUED:
            adjust_credits(agreement)

        notifications_credit_agreement(agreement)

    @action(detail=True, methods=['get'])
    def minio_url(self, request, pk=None):
        object_name = uuid.uuid4().hex
        url = minio_put_object(object_name)

        return Response({
            'url': url,
            'minio_object_name': object_name
        })

    @action(detail=False, methods=['get'])
    def model_year_reports(self, request):
        user = self.request.user
        if user.is_government:
            model_year_reports = ModelYearReport.objects.filter(validation_status='ASSESSED').order_by('model_year_id', 'organization_name')
            serializer = ModelYearReportsSerializer(model_year_reports, many=True)
            return Response(serializer.data)
        return Response({})


    @action(detail=False, methods=['get'])
    def transaction_types(self, request):
        types_list = []

        for data in CreditAgreementTransactionTypes:
            # The following two transaction types are
            # deprecated but kept to maintain transaction history
            if data == CreditAgreementTransactionTypes.REASSESSMENT_ALLOCATION \
              or data == CreditAgreementTransactionTypes.REASSESSMENT_REDUCTION:
                continue
            types_list.append(data.value)

        return Response(types_list)

    @action(detail=True, methods=['post', 'patch'])
    def comment_save(self, request, pk):
        comment = request.data.get('comment')
        director = request.data.get('director')
        
        if comment:
            if director:
                CreditAgreementComment.objects.create(
                    credit_agreement_id=pk,
                    comment=comment,
                    to_director=director,
                    create_user=request.user.username,
                    update_user=request.user.username,
                )
            else:
                CreditAgreementComment.objects.update_or_create(
                    credit_agreement_id=pk,
                    comment=comment,
                    to_director=director,
                    create_user=request.user.username,
                    update_user=request.user.username,
                )
        return Response({'saved': True})

    def list(self, request):
        """
        Get all the credit agreements
        """
        credit_agreements = self.get_queryset()

        serializer = self.get_serializer(credit_agreements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["PATCH"])
    def update_comment(self, request, pk):
        comment_id = request.data.get("comment_id")
        comment_text = request.data.get("comment_text")
        username = request.user.username
        comment = get_comment(comment_id)
        if username == comment.create_user:
            updated_comment = update_comment_text(comment, comment_text)
            serializer = CreditAgreementCommentSerializer(updated_comment)
            return Response(serializer.data)
        return Response(status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=["PATCH"])
    def delete_comment(self, request, pk):
        comment_id = request.data.get("comment_id")
        username = request.user.username
        comment = get_comment(comment_id)
        if username == comment.create_user:
            delete_comment(comment_id)
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_403_FORBIDDEN)

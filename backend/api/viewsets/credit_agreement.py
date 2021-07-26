import uuid

from django.utils.decorators import method_decorator
from django.db.models import Q

from rest_framework import mixins, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

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
from auditable.views import AuditableMixin
from api.models.credit_agreement_statuses import CreditAgreementStatuses


class CreditAgreementViewSet(
    AuditableMixin, viewsets.GenericViewSet, mixins.CreateModelMixin,
    mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin
):
    permission_classes = (permissions.AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = CreditAgreement.objects.all()
    serializer_classes = {
        'default': CreditAgreementSerializer,
        'create': CreditAgreementSaveSerializer,
        'update': CreditAgreementSaveSerializer,
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
                        
                        ])) |
                Q(organization_id=request.user.organization.id)
                ).exclude(status__in=[CreditAgreementStatuses.DELETED])
        return queryset

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def perform_update(self, serializer, *args, **kwargs):
        agreement = serializer.save()
        if agreement.status == CreditAgreementStatuses.ISSUED:
            adjust_credits(agreement)

    @action(detail=True, methods=['get'])
    def minio_url(self, request, pk=None):
        object_name = uuid.uuid4().hex
        url = minio_put_object(object_name)

        return Response({
            'url': url,
            'minio_object_name': object_name
        })

    @action(detail=False, methods=['get'])
    def transaction_types(self, request):
        types_list = []

        for data in CreditAgreementTransactionTypes:
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

    def get_queryset(self):
        request = self.request

        queryset = CreditAgreement.objects.all()

        return queryset

    def list(self, request):
        """
        Get all the credit agreements
        """
        creditAgreements = self.get_queryset()

        serializer = self.get_serializer(creditAgreements, many=True)
        return Response(serializer.data)

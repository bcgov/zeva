from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models.credit_transaction import CreditTransaction
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.serializers.credit_transaction import CreditTransactionSerializer, \
    CreditTransactionBalanceSerializer
from api.services.credit_transaction import aggregate_credit_balance_details
from auditable.views import AuditableMixin


class CreditTransactionViewSet(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.ListModelMixin, mixins.RetrieveModelMixin
):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'default': CreditTransactionSerializer,
        'balances': CreditTransactionBalanceSerializer,
    }

    def get_queryset(self):
        user = self.request.user
        org = user.organization

        if org.is_government:
            qs = CreditTransaction.objects.all().filter(
                Q(transaction_type__transaction_type__in=[
                    "Reduction", "Validation"
                ]) |
                (Q(transaction_type__transaction_type="Credit Transfer") &
                 Q(credit_transfer_content__credit_transfer__status__in=[
                     CreditTransferStatuses.VALIDATED
                 ]))
            ).order_by('id')
        else:
            qs = CreditTransaction.objects.filter(
                Q(debit_from=org) | Q(credit_to=org)
            ).filter(
                Q(transaction_type__transaction_type__in=[
                    "Reduction", "Validation"
                ]) |
                (Q(transaction_type__transaction_type="Credit Transfer") &
                 Q(credit_transfer_content__credit_transfer__status__in=[
                     CreditTransferStatuses.VALIDATED
                 ]))
            ).order_by('id')

        return qs

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    @action(detail=False)
    def balances(self, request):
        user = self.request.user
        balances = aggregate_credit_balance_details(user.organization)

        serializer = self.get_serializer(balances, many=True)
        return Response(serializer.data)

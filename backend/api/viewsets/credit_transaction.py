from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models.credit_transaction import CreditTransaction
from api.serializers.credit_transaction import CreditTransactionSerializer, \
    CreditTransactionBalanceSerializer, CreditTransactionListSerializer
from api.services.credit_transaction import aggregate_credit_balance_details, \
    aggregate_transactions_by_submission
from auditable.views import AuditableMixin


class CreditTransactionViewSet(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.ListModelMixin, mixins.RetrieveModelMixin
):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'default': CreditTransactionSerializer,
        'list': CreditTransactionListSerializer,
        'balances': CreditTransactionBalanceSerializer,
    }

    def get_queryset(self):
        user = self.request.user
        org = user.organization

        if org.is_government:
            qs = CreditTransaction.objects.all().order_by('id')
        else:
            qs = CreditTransaction.objects.filter(
                Q(debit_from=org) | Q(credit_to=org)
            ).order_by('id')

        return qs

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def list(self, request):
        user = self.request.user
        transactions = aggregate_transactions_by_submission(user.organization)

        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def balances(self, request):
        user = self.request.user
        balances = aggregate_credit_balance_details(user.organization)

        serializer = self.get_serializer(balances, many=True)
        return Response(serializer.data)

from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from api.models.credit_transaction import CreditTransaction
from api.serializers.credit_transction import CreditTransactionSerializer
from auditable.views import AuditableMixin


class CreditTransactionViewSet(AuditableMixin, viewsets.GenericViewSet,
                               mixins.ListModelMixin, mixins.RetrieveModelMixin):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'default': CreditTransactionSerializer,
    }

    def get_queryset(self):
        user = self.request.user
        org = user.organization

        if org.is_government:
            qs = CreditTransaction.objects.all()
        else:
            qs = CreditTransaction.objects.filter(Q(debit_from=org) | Q(credit_to=org))

        return qs

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

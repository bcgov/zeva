from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import F, Q

from api.models.record_of_sale import RecordOfSale
from api.models.record_of_sale_statuses import RecordOfSaleStatuses
from api.models.user_profile import UserProfile
from api.serializers.record_of_sale import RecordOfSaleSerializer
from api.serializers.user import UserSerializer
from auditable.views import AuditableMixin


class RecordOfSaleViewset(
    AuditableMixin, viewsets.GenericViewSet,
    mixins.ListModelMixin, mixins.RetrieveModelMixin
):
    permission_classes = (AllowAny,)
    http_method_names = ['get', ]

    def get_queryset(self):
        user = self.request.user

        if user.organization.is_government:
            qs = RecordOfSale.objects.exclude(validation_status__in=(RecordOfSaleStatuses.DRAFT,
                                                                     RecordOfSaleStatuses.NEW))
        else:
            qs = RecordOfSale.objects.filter(organization=user.organization)

        return qs

    serializer_classes = {
        'default': RecordOfSaleSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

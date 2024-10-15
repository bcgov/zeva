from datetime import datetime

from django.db.models import Q
from rest_framework import filters, mixins, permissions, viewsets

from api.models.signing_authority_assertion import SigningAuthorityAssertion
from api.serializers.signing_authority_assertion import \
    SigningAuthorityAssertionSerializer


class SigningAuthorityAssertionViewSet(
        viewsets.GenericViewSet,
        mixins.ListModelMixin,
):
    """
    This viewset automatically provides `list`
    """
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get']
    queryset = SigningAuthorityAssertion.objects.all()
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = '__all__'
    ordering = ('display_order',)
    serializer_class = SigningAuthorityAssertionSerializer

    def get_queryset(self):
        as_of = datetime.today()

        return SigningAuthorityAssertion.objects.filter(
            effective_date__lte=as_of
        ).filter(
            Q(expiration_date__gte=as_of) | Q(expiration_date=None)
        )

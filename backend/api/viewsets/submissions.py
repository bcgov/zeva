from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.sales_submission import SalesSubmissionSerializer, \
    SalesSubmissionListSerializer
from auditable.views import AuditableMixin


class SalesSubmissionsViewset(
    AuditableMixin, viewsets.GenericViewSet,
    mixins.ListModelMixin, mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin
):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'patch', 'post', 'put']

    def get_queryset(self):
        user = self.request.user

        if user.organization.is_government:
            qs = SalesSubmission.objects.exclude(validation_status__in=(
                SalesSubmissionStatuses.DRAFT,
                SalesSubmissionStatuses.NEW
            ))
        else:
            qs = SalesSubmission.objects.filter(organization=user.organization)

        return qs

    serializer_classes = {
        'default': SalesSubmissionListSerializer,
        'retrieve': SalesSubmissionSerializer,
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def update(self, request, pk=None, *args, **kwargs):
        # TODO - Move this to a serializer
        ids = request.data.get('ids')
        validation_status = request.data.get('validation_status')

        if ids is not None:
            RecordOfSale.objects.filter(id__in=ids).update(
                validation_status=validation_status
            )
        else:
            SalesSubmission.objects.filter(id=pk).update(
                validation_status=validation_status
            )

        return Response(None, status=status.HTTP_200_OK)

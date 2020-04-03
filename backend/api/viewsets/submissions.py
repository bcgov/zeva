from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.services.credit_transaction import award_credits
from api.models.credit_transaction import CreditTransaction
from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.sales_submission import SalesSubmissionSerializer, \
    SalesSubmissionListSerializer, SalesSubmissionSaveSerializer
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
        'partial_update': SalesSubmissionSaveSerializer,
        'update': SalesSubmissionSaveSerializer,
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def perform_update(self, serializer):
        submission = serializer.save()

        if submission.validation_status == SalesSubmissionStatuses.VALIDATED:
            award_credits(submission)

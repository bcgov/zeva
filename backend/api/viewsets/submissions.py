from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.sales_submission import SalesSubmissionSerializer, SalesSubmissionListSerializer
from auditable.views import AuditableMixin


class SalesSubmissionsViewset(
    AuditableMixin, viewsets.GenericViewSet,
    mixins.ListModelMixin, mixins.RetrieveModelMixin
):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post']

    def get_queryset(self):
        user = self.request.user

        if user.organization.is_government:
            qs = SalesSubmission.objects.exclude(validation_status__in=(SalesSubmissionStatuses.DRAFT,
                                                                        SalesSubmissionStatuses.NEW))
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

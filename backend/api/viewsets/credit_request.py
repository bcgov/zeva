import json

from datetime import datetime
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny

from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.sales_submission import SalesSubmissionSerializer, \
    SalesSubmissionListSerializer, SalesSubmissionSaveSerializer
from api.services.credit_transaction import award_credits
from api.services.sales_spreadsheet import create_sales_spreadsheet, \
    ingest_sales_spreadsheet, validate_spreadsheet, \
    create_errors_spreadsheet
from auditable.views import AuditableMixin


class CreditRequestViewset(
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
                SalesSubmissionStatuses.NEW,
                SalesSubmissionStatuses.DELETED,
            ))
        else:
            qs = SalesSubmission.objects.filter(
                organization=user.organization
            ).exclude(validation_status__in=(
                SalesSubmissionStatuses.DELETED,
            ))

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

    @action(detail=False)
    def template(self, request):
        """
        Download Record of Sale Template
        """
        user = request.user
        response = HttpResponse(content_type='application/ms-excel')
        create_sales_spreadsheet(user.organization, response)
        organization_name = user.organization.name

        if user.organization.short_name:
            organization_name = user.organization.short_name

        response['Content-Disposition'] = (
            'attachment; filename="BC-ZEVA_Sales_Template_{org}_{date}.xls"'
            .format(
                org=organization_name.replace(' ', '_'),
                date=datetime.now().strftime(
                    "_%Y-%m-%d")
            )
        )
        return response

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        Upload and parse record of sales xls
        """
        user = request.user

        jsondata = {}

        try:
            file = request.FILES['files']

            data = file.read()
            file.close()

            validate_spreadsheet(data, user_organization=user.organization)

            if data:
                submission_id = request.data.get('id', None)

                result = ingest_sales_spreadsheet(
                    data, user=user,
                    submission_id=submission_id
                )

                jsondata = json.dumps(
                    result,
                    sort_keys=True,
                    indent=1,
                    cls=DjangoJSONEncoder
                )

        except ValidationError as error:
            return HttpResponse(status=400, content=error)

        return HttpResponse(
            status=201, content=jsondata, content_type='application/json'
        )

    @action(detail=True)
    def download_errors(self, request, pk):
        """
        Download a Spreadsheet containing all the rows that contain errors
        """
        user = request.user
        response = HttpResponse(content_type='application/ms-excel')
        create_errors_spreadsheet(pk, user.organization_id, response)
        organization_name = user.organization.name

        if user.organization.short_name:
            organization_name = user.organization.short_name

        response['Content-Disposition'] = (
            'attachment; filename="BC-ZEVA_Sales_Errors_{org}_{date}.xls"'
            .format(
                org=organization_name.replace(' ', '_'),
                date=datetime.now().strftime(
                    "_%Y-%m-%d")
            )
        )
        return response

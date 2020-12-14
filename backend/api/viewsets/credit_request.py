import json

from datetime import datetime
from django.core.paginator import Paginator
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Subquery, Count
from django.db.models import Q
from django.http import HttpResponse, HttpResponseForbidden

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.sales_submission import SalesSubmissionSerializer, \
    SalesSubmissionListSerializer, SalesSubmissionSaveSerializer
from api.serializers.sales_submission_content import \
    SalesSubmissionContentSerializer
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
        'content': SalesSubmissionContentSerializer,
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
                    submission_id=submission_id,
                    filename=file
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

    @action(detail=True)
    def content(self, request, pk):
        filters = request.GET.get('filters')
        page_size = request.GET.get('page_size', 20)
        page = request.GET.get('page', 1)
        sort_by = request.GET.get('sorted')

        try:
            page = int(page)
        except:
            page = 1

        if page < 1:
            page = 1

        # only government should be able to view the contents for icbc
        # verification
        if not request.user.is_government:
            return HttpResponseForbidden()

        submission_content = SalesSubmissionContent.objects.filter(
            submission_id=pk
        )

        if filters:
            submission_filters = json.loads(filters)

            if 'xls_make' in submission_filters:
                submission_content = submission_content.filter(
                    xls_make__icontains=submission_filters['xls_make']
                )

            if 'xls_model' in submission_filters:
                submission_content = submission_content.filter(
                    xls_model__icontains=submission_filters['xls_model']
                )

            if 'xls_model_year' in submission_filters:
                submission_content = submission_content.filter(
                    xls_model_year__icontains=submission_filters['xls_model_year']
                )

            if 'xls_vin' in submission_filters:
                submission_content = submission_content.filter(
                    xls_vin__icontains=submission_filters['xls_vin']
                )

            if 'warning' in submission_filters:
                duplicate_vins = Subquery(submission_content.annotate(
                    vin_count=Count('xls_vin')
                ).filter(vin_count__gt=1).values_list('xls_vin', flat=True))

                awarded_vins = Subquery(RecordOfSale.objects.exclude(
                    submission_id=pk
                ).values_list('vin', flat=True))

                submission_content = submission_content.filter(
                    Q(xls_vin__in=duplicate_vins) |
                    Q(xls_vin__in=awarded_vins) |
                    ~Q(xls_vin__in=Subquery(
                        IcbcRegistrationData.objects.values('vin')
                    )) |
                    Q(xls_sale_date__lte="43102.0")
                )

        if sort_by:
            order_by = []
            sort_by_list = sort_by.split(',')
            for sort in sort_by_list:
                if sort in [
                    'xls_make', 'xls_model', 'xls_model_year',
                    'xls_sale_date', 'xls_vin',
                    '-xls_make', '-xls_model', '-xls_model_year',
                    '-xls_sale_date', '-xls_vin',
                ]:
                    order_by.append(sort)

            if order_by:
                submission_content = submission_content.order_by(*order_by)

        submission_content_paginator = Paginator(submission_content, page_size)

        paginated = submission_content_paginator.page(page)

        serializer = SalesSubmissionContentSerializer(
            paginated, many=True, read_only=True, context={'request': request}
        )

        return Response({
            'content': serializer.data,
            'pages': submission_content_paginator.num_pages
        })

    @action(detail=True)
    def unselected(self, request, pk):
        if not request.user.is_government:
            return HttpResponseForbidden()

        selected_vins = Subquery(RecordOfSale.objects.filter(
            submission_id=pk
        ).values_list('vin', flat=True))

        unselected_vins = SalesSubmissionContent.objects.filter(
            submission_id=pk
        ).exclude(
            xls_vin__in=selected_vins
        ).values_list('id', flat=True)

        return Response(list(unselected_vins))

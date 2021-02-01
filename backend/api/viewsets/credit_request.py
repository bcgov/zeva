import json
import uuid

from datetime import datetime
from django.core.paginator import Paginator
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Subquery, Count, Q
from django.db.models.expressions import RawSQL
from django.http import HttpResponse, HttpResponseForbidden
from api.services.minio import minio_put_object

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.permissions.credit_request import CreditRequestPermissions
from api.serializers.sales_submission import SalesSubmissionSerializer, \
    SalesSubmissionListSerializer, SalesSubmissionSaveSerializer
from api.serializers.sales_submission_content import \
    SalesSubmissionContentSerializer
from api.services.credit_transaction import award_credits
from api.services.sales_spreadsheet import create_sales_spreadsheet, \
    ingest_sales_spreadsheet, validate_spreadsheet, \
    create_errors_spreadsheet
from api.services.send_email import notifications_credit_application
from auditable.views import AuditableMixin


class CreditRequestViewset(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.ListModelMixin, mixins.RetrieveModelMixin,
        mixins.UpdateModelMixin
):
    permission_classes = (CreditRequestPermissions,)
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

        notifications_credit_application(submission)

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
        upload_new = request.data.get('upload_new', False)
        if not upload_new:
            return HttpResponse(
                status=200, content=json.dumps({
                    'id': request.data.get('id', None)
                }), content_type='application/json'
            )
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
                duplicate_vins = []
                awarded_vins = []
                not_registered = Q(xls_vin__in=[])
                sale_date = Q(xls_vin__in=[])
                mismatch_vins = Q(xls_vin__in=[])
                invalid_date = Q(xls_vin__in=[])

                if submission_filters['warning'] == '1' or \
                        '3' in submission_filters['warning']:
                    duplicate_vins = Subquery(submission_content.values(
                        'xls_vin'
                    ).annotate(
                        vin_count=Count('xls_vin')
                    ).values_list(
                        'xls_vin', flat=True
                    ).filter(vin_count__gt=1))

                if submission_filters['warning'] == '1' or \
                        '2' in submission_filters['warning']:
                    awarded_vins = Subquery(RecordOfSale.objects.exclude(
                        submission_id=pk
                    ).values_list('vin', flat=True))

                if submission_filters['warning'] == '1' or \
                        '11' in submission_filters['warning']:
                    not_registered = ~Q(xls_vin__in=Subquery(
                        IcbcRegistrationData.objects.values('vin')
                    ))

                if submission_filters['warning'] == '1' or \
                        '5' in submission_filters['warning']:
                    sale_date = Q(Q(xls_sale_date__lte="43102.0") & ~Q(xls_sale_date=""))

                if submission_filters['warning'] == '1' or \
                        '6' in submission_filters['warning']:
                    invalid_date = Q(Q(xls_sale_date__lte="0") | Q(xls_sale_date=""))

                if submission_filters['warning'] == '1' or \
                        '4' in submission_filters['warning']:
                    mismatch_vins = Q(id__in=RawSQL(" \
                        SELECT id FROM sales_submission_content a, \
                            (SELECT vin, make, CAST(description as float) \
                                as model_year \
                            FROM icbc_registration_data JOIN icbc_vehicle \
                                ON icbc_vehicle_id = icbc_vehicle.id JOIN \
                                    model_year \
                                ON model_year_id = model_year.id) as b \
                            WHERE a.xls_vin = b.vin AND \
                                (xls_make != b.make OR \
                                    CAST(xls_model_year as float) \
                                        != b.model_year) \
                            AND submission_id = %s",
                        (pk,)
                    ))

                submission_content = submission_content.filter(
                    Q(xls_vin__in=duplicate_vins) |
                    Q(xls_vin__in=awarded_vins) |
                    not_registered |
                    sale_date |
                    invalid_date |
                    mismatch_vins
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

        submission = SalesSubmission.objects.get(id=pk)

        reset = request.GET.get('reset', None)

        if submission.validation_status == SalesSubmissionStatuses.SUBMITTED or \
                reset == 'Y':
            submission_content = SalesSubmissionContent.objects.filter(
                submission_id=pk
            )

            duplicate_vins = Subquery(submission_content.values(
                'xls_vin'
            ).annotate(
                vin_count=Count('xls_vin')
            ).values_list(
                'xls_vin', flat=True
            ).filter(vin_count__gt=1))

            awarded_vins = Subquery(RecordOfSale.objects.exclude(
                submission_id=pk
            ).values_list('vin', flat=True))

            unselected_vins = submission_content.filter(
                Q(xls_vin__in=duplicate_vins) |
                Q(xls_vin__in=awarded_vins) |
                ~Q(xls_vin__in=Subquery(
                    IcbcRegistrationData.objects.values('vin')
                )) |
                Q(xls_sale_date__lte="43102.0")
            ).values_list('id', flat=True)
        else:
            selected_vins = Subquery(RecordOfSale.objects.filter(
                submission_id=pk
            ).values_list('vin', flat=True))

            unselected_vins = SalesSubmissionContent.objects.filter(
                submission_id=pk
            ).exclude(
                xls_vin__in=selected_vins
            ).values_list('id', flat=True)

        return Response(list(unselected_vins))

    @action(detail=True, methods=['get'])
    def minio_url(self, request, pk=None):
        object_name = uuid.uuid4().hex
        url = minio_put_object(object_name)

        return Response({
            'url': url,
            'minio_object_name': object_name
        })

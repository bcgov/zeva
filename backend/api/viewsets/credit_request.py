import json
import uuid

from datetime import datetime
from django.core.paginator import Paginator
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Subquery, Count, Q
from django.db.models.expressions import RawSQL
from django.http import HttpResponse, HttpResponseForbidden
from api.models.sales_submission_comment import SalesSubmissionComment
from api.serializers.sales_submission_comment import SalesSubmissionCommentSerializer

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.sales_submission_content_reason import \
    SalesSubmissionContentReason
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.permissions.credit_request import CreditRequestPermissions
from api.serializers.sales_submission import SalesSubmissionSerializer, \
    SalesSubmissionBaseListSerializer, SalesSubmissionListSerializer, SalesSubmissionSaveSerializer
from api.serializers.sales_submission_content import \
    SalesSubmissionContentSerializer
from api.serializers.sales_submission_content_reason import \
    SalesSubmissionContentReasonSerializer
from api.services.credit_transaction import award_credits
from api.services.minio import minio_put_object
from api.services.sales_spreadsheet import create_sales_spreadsheet, \
    ingest_sales_spreadsheet, validate_spreadsheet, \
    create_errors_spreadsheet, create_details_spreadsheet
from api.services.send_email import notifications_credit_application
from auditable.views import AuditableMixin
import numpy as np
from api.paginations import BasicPagination
from api.services.filter_utilities import get_search_type_and_terms, get_search_q_object


class CreditRequestViewset(
        AuditableMixin, viewsets.GenericViewSet,
        mixins.ListModelMixin, mixins.RetrieveModelMixin,
        mixins.UpdateModelMixin
):
    pagination_class = BasicPagination
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
        'paginated': SalesSubmissionBaseListSerializer
    }

    suffix_type_dict = {
        ";": "icontains",
        "'": "iexact"
    }
    delimiter = ","

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def perform_update(self, serializer):
        submission = serializer.save()

        if submission.validation_status == SalesSubmissionStatuses.VALIDATED:
            award_credits(submission)

        if self.request.method != "PATCH":
            notifications_credit_application(submission)

    @action(detail=False, methods=['post'])
    def paginated(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        filters = request.data.get("filters")
        sorts = request.data.get("sorts")
        for filter in filters:
            id = filter.get("id")
            value = filter.get("value")
            search = get_search_type_and_terms(value, self.delimiter, self.suffix_type_dict)
            search_type = search["type"]
            search_terms = search["terms"]
            if id == "id":
                q_obj = get_search_q_object(search_terms, search_type, "id")
                if q_obj:
                    queryset = queryset.filter(q_obj)
            elif id == "supplier":
                q_obj = get_search_q_object(search_terms, search_type, "organization__short_name")
                if q_obj:
                    queryset = queryset.filter(q_obj)
            elif id == "status":
                queryset = self.filter_by_status(queryset, search_type, search_terms)
        for sort in sorts:
            id = sort.get("id")
            desc = sort.get("desc")
            if id == "id":
                if desc:
                    queryset = queryset.order_by("-id")
                else:
                    queryset = queryset.order_by("id")
            elif id == "supplier":
                if desc:
                    queryset = queryset.order_by("-organization__short_name")
                else:
                    queryset = queryset.order_by("organization__short_name")
        
        if len(sorts) == 0:
            queryset = queryset.order_by("-id")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def filter_by_status(self, queryset, search_type, search_terms):
        mappings = {
            "validated": SalesSubmissionStatuses.CHECKED.value,
            "issued": SalesSubmissionStatuses.VALIDATED.value,
            "recommend issuance": SalesSubmissionStatuses.RECOMMEND_APPROVAL.value,
            "new": SalesSubmissionStatuses.NEW.value,
            "draft": SalesSubmissionStatuses.DRAFT.value,
            "submitted": SalesSubmissionStatuses.SUBMITTED.value,
            "rejected": SalesSubmissionStatuses.REJECTED.value,
            "recommend rejection": SalesSubmissionStatuses.RECOMMEND_REJECTION.value,
        }
        mapping_keys = list(mappings.keys())
        contains_unmapped_search_term = False
        mapped_search_terms = []

        if search_type == "iexact":
            for search_term in search_terms:
                transformed_search_term = search_term.lower()
                mapped_search_term = mappings.get(transformed_search_term)
                if mapped_search_term:
                    mapped_search_terms.append(mapped_search_term)
                else:
                    contains_unmapped_search_term = True
        else:
            for search_term in search_terms:
                transformed_search_term = search_term.lower()
                for mapping_key in mapping_keys:
                    if transformed_search_term in mapping_key:
                        mapped_search_terms.append(mappings[mapping_key])
                    else:
                        contains_unmapped_search_term = True
                
        final_q = get_search_q_object(mapped_search_terms, "exact", "validation_status", [Q(id=-1)] if contains_unmapped_search_term else [])

        if final_q:
            return queryset.filter(final_q)

        return queryset

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
        page_size = request.GET.get('page_size', 100)
        page = request.GET.get('page', 1)
        sort_by = request.GET.get('sorted')
        verify_with_icbc_data = request.GET.get('reset', None)

        # only government should be able to view the contents for icbc
        # verification
        if not request.user.is_government:
            return HttpResponseForbidden()

        submission_content = SalesSubmissionContent.objects.filter(
            submission_id=pk
        )

        if verify_with_icbc_data == 'Y':
            # updates update_timestamp fields on submission content
            # which will update warning flags to match current data
            for sub in submission_content.all():
                sub.save()

        try:
            page = int(page)
        except:
            page = 1

        if page < 1:
            page = 1

        extra_filter_by = []
        extra_filter_params = []

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

            if 'warning' in submission_filters or \
                    'include_overrides' in submission_filters:
                duplicate_vins = []
                awarded_vins = []
                not_registered = Q(xls_vin__in=[])
                sale_date = Q(xls_vin__in=[])
                mismatch_vins = Q(xls_vin__in=[])
                invalid_date = Q(xls_vin__in=[])
                overridden_vins = Q(xls_vin__in=[])

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
                    sale_date = Q(
                        Q(
                            Q(xls_sale_date__lte="43102.0") &
                            Q(xls_date_type="3") &
                            ~Q(xls_sale_date="")
                        ) |
                        Q(
                            Q(xls_sale_date__lte="2018-01-02") &
                            Q(xls_date_type="1") &
                            ~Q(xls_sale_date="")
                        )
                    )

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

                if 'include_overrides' in submission_filters and \
                        submission_filters['include_overrides']:
                    overridden_vins = Q(reason__isnull=False)

                submission_content = submission_content.filter(
                    Q(xls_vin__in=duplicate_vins) |
                    Q(xls_vin__in=awarded_vins) |
                    not_registered |
                    sale_date |
                    invalid_date |
                    mismatch_vins |
                    overridden_vins
                )

            if 'model_year.description' in submission_filters:
                extra_filter_by.append('UPPER(model_year.description) LIKE %s')
                string = submission_filters['model_year.description'].replace('%', '')
                extra_filter_params.append('%' + string.upper() + '%')

            if 'icbc_vehicle.make' in submission_filters:
                extra_filter_by.append('UPPER(icbc_vehicle.make) LIKE %s')
                string = submission_filters['icbc_vehicle.make'].replace('%', '')
                extra_filter_params.append('%' + string.upper() + '%')

            if 'icbc_vehicle.model_name' in submission_filters:
                extra_filter_by.append('UPPER(icbc_vehicle.model_name) LIKE %s')
                string = submission_filters['icbc_vehicle.model_name'].replace('%', '')
                extra_filter_params.append('%' + string.upper() + '%')

        extra_order_by = []

        if sort_by:
            order_by = []
            sort_by_list = sort_by.split(',')
            for sort in sort_by_list:
                if sort in [
                    'model_year.description',
                    '-model_year.description',
                    'icbc_vehicle.make',
                    '-icbc_vehicle.make',
                    'icbc_vehicle.model_name',
                    '-icbc_vehicle.model_name'
                ]:
                    extra_order_by.append(sort)
                if sort in [
                    'xls_make', 'xls_model', 'xls_model_year',
                    'xls_sale_date', 'xls_vin',
                    '-xls_make', '-xls_model', '-xls_model_year',
                    '-xls_sale_date', '-xls_vin'
                ]:
                    order_by.append(sort)

            if order_by:
                submission_content = submission_content.order_by(*order_by)

        if extra_order_by or extra_filter_by:
            where_clause = [
                'icbc_registration_data.vin=sales_submission_content.xls_vin',
                'icbc_registration_data.icbc_vehicle_id=icbc_vehicle.id',
                'icbc_vehicle.model_year_id=model_year.id'
            ]

            where_clause.extend(extra_filter_by)

            submission_content = submission_content.extra(
                tables=[
                    'icbc_registration_data',
                    'icbc_vehicle',
                    'model_year'
                ],
                where=where_clause,
                params=extra_filter_params,
                order_by=extra_order_by
            )

        submission_content_paginator = Paginator(submission_content, page_size)

        paginated = submission_content_paginator.page(page)

        serializer = SalesSubmissionContentSerializer(
            paginated, many=True, read_only=True, context={'request': request}
        )
        errorList = list(np.concatenate([sc.warnings for sc in submission_content]))
        newErrorList = []
        for error in errorList:
            if error == 'NO_ICBC_MATCH':
                newErrorList.append('NO_ICBC_MATCH')
            if error == 'VIN_ALREADY_AWARDED':
                newErrorList.append('VIN_ALREADY_AWARDED')
            if error == 'DUPLICATE_VIN':
                newErrorList.append('DUPLICATE_VIN')
            if error in ['INVALID_MODEL', 'MODEL_YEAR_MISMATCHED', 'MAKE_MISMATCHED']:
                newErrorList.append('ERROR_41')
            if error == 'EXPIRED_REGISTRATION_DATE':
                newErrorList.append('EXPIRED_REGISTRATION_DATE')
            if error == 'INVALID_DATE':
                newErrorList.append('INVALID_DATE')
            else:
                pass
        errorKey, errorCounts = np.unique(newErrorList, return_counts=True)
        errorDict = dict(zip(errorKey, errorCounts))
        errorDict.update({"TOTAL": sum(list(errorCounts))})
        return Response({
            'content': serializer.data,
            'pages': submission_content_paginator.num_pages,
            'errors': errorDict
        })

    @action(detail=True)
    def unselected(self, request, pk):
        if not request.user.is_government:
            return HttpResponseForbidden()

        verify_with_icbc_data = request.GET.get('reset', None)

        if verify_with_icbc_data == 'Y':
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

            pre_existing_vins = Subquery(RecordOfSale.objects.exclude(
                submission_id=pk
            ).exclude(
                submission__validation_status='REJECTED'
            ).values_list('vin', flat=True))

            unselected_vins = submission_content.filter(
                Q(xls_vin__in=duplicate_vins) |
                Q(xls_vin__in=pre_existing_vins) |
                ~Q(xls_vin__in=Subquery(
                    IcbcRegistrationData.objects.values('vin')
                )) |
                Q(
                    Q(
                        Q(xls_sale_date__lte="43102.0") &
                        Q(xls_date_type="3")
                    ) |
                    Q(
                        Q(xls_sale_date__lte="2018-01-02") &
                        Q(xls_date_type="1")
                    )
                )
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

    @action(detail=False, methods=['get'])
    def reasons(self, request):
        reasons = SalesSubmissionContentReason.objects.all()

        return Response(reasons.values_list('reason', flat=True))

    @action(detail=True)
    def download_details(self, request, pk):
        """Download a spreadsheet containing submisssion details"""
        response = HttpResponse(content_type='application/ms-excel')
        serializer = SalesSubmissionContentSerializer(many=True, read_only=True, context={'request': request})
        create_details_spreadsheet(pk, response)
        submission = SalesSubmission.objects.get(
            id=pk
        )
        organization_name = submission.organization.name
        if submission.organization.short_name:
            organization_name = submission.organization.short_name

        response['Content-Disposition'] = (
            'attachment; filename="Details_Submission_{pk}_{org}_{date}.xls"'
            .format(
                pk=pk,
                org=organization_name.replace(' ', '_'),
                date=datetime.now().strftime(
                    "_%Y-%m-%d")
            )
        )
        return response

    @action(detail=True, methods=["PATCH"])
    def update_comment(self, request, pk):
        comment_text = request.data.get("comment")
        username = request.user.username
        comment = SalesSubmissionComment.objects.get(
            id=pk
        )
        if username == comment.create_user:
            serializer = SalesSubmissionCommentSerializer(comment, data={'comment': comment_text}, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        return Response(status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=["PATCH"])
    def delete_comment(self, request, pk):
        username = request.user.username
        comment = SalesSubmissionComment.objects.get(
            id=pk
        )
        if username == comment.create_user:
            comment.delete()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_403_FORBIDDEN)

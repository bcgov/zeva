import json
import uuid

from datetime import datetime
from django.core.paginator import Paginator
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Subquery, Q
from django.http import HttpResponse, HttpResponseForbidden
from api.models.sales_submission_comment import SalesSubmissionComment
from api.serializers.sales_submission_comment import SalesSubmissionCommentSerializer

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.sales_submission_content_reason import SalesSubmissionContentReason
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.permissions.credit_request import CreditRequestPermissions
from api.serializers.sales_submission import (
    SalesSubmissionSerializer,
    SalesSubmissionBaseListSerializer,
    SalesSubmissionListSerializer,
    SalesSubmissionSaveSerializer,
)
from api.serializers.sales_submission_content import SalesSubmissionContentSerializer, SalesSubmissionContentBulkSerializer
from api.services.credit_transaction import award_credits
from api.services.sales_submission import check_validation_status_change
from api.services.minio import minio_put_object
from api.services.sales_spreadsheet import (
    create_sales_spreadsheet,
    ingest_sales_spreadsheet,
    validate_spreadsheet,
    create_errors_spreadsheet,
    create_details_spreadsheet,
)
from auditable.views import AuditableUpdateMixin
import numpy as np
from api.paginations import BasicPagination
from api.services.filter_utilities import get_search_terms, get_search_q_object
from api.services.sales_submission import get_map_of_sales_submission_ids_to_timestamps
from api.services.sales_submission import get_warnings_and_maps, get_helping_objects
from api.utilities.generic import get_inverse_map
from api.permissions.same_organization import SameOrganizationPermissions


class CreditRequestViewset(
        viewsets.GenericViewSet,
        AuditableUpdateMixin, 
        mixins.ListModelMixin, 
        mixins.RetrieveModelMixin,
):
    pagination_class = BasicPagination
    permission_classes = [SameOrganizationPermissions & CreditRequestPermissions]
    same_org_permissions_context = {
        "default_manager": SalesSubmission.objects,
        "default_path_to_org": ("organization",),
        "actions_not_to_check": [
            "retrieve", "partial_update", "download_errors", "content", "unselected", "minio_url", "reasons",
            "update_comment", "delete_comment"
        ]
    }
    http_method_names = ['get', 'patch', 'post']

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
        'content': SalesSubmissionContentSerializer,
        'paginated': SalesSubmissionBaseListSerializer
    }

    default_delimiter = ","
    default_search_type = "icontains"

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def perform_update(self, serializer):
        validation_status = self.request.data.get("validation_status")

        submission_check = SalesSubmission.objects.filter(
            id=serializer.instance.id,
        ).first()

        submission = serializer.save()
        check_validation_status_change(submission_check.validation_status, validation_status, submission)

        if submission.validation_status == SalesSubmissionStatuses.VALIDATED:
            award_credits(submission)

    @action(detail=False, methods=['post'])
    def paginated(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        filters = request.data.get("filters")
        sorts = request.data.get("sorts")
        sort_by_date = False
        sort_by_date_direction = None

        for filter in filters:
            id = filter.get("id")
            value = filter.get("value")
            delimiter = filter.get("delimiter", self.default_delimiter)
            search_type = filter.get("search_type", self.default_search_type)
            search_terms = get_search_terms(value, delimiter)
            if id == "id":
                q_obj = get_search_q_object(search_terms, search_type, "id")
                if q_obj:
                    queryset = queryset.filter(q_obj)
            elif id == "supplier":
                q_obj = get_search_q_object(
                    search_terms, search_type, "organization__short_name"
                )
                if q_obj:
                    queryset = queryset.filter(q_obj)
            elif id == "status":
                queryset = self.filter_by_status(queryset, search_type, search_terms, request.user)
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
            elif id == "date":
                sort_by_date = True
                sort_by_date_direction = "DESC" if desc else "ASC"

        if len(sorts) == 0:
            queryset = queryset.order_by("-id")

        if sort_by_date and sort_by_date_direction:
            user_is_government = request.user.is_government
            map_of_sales_submission_ids_to_timestamps = (
                get_map_of_sales_submission_ids_to_timestamps(user_is_government)
            )
            sales_submissions = list(queryset)
            reverse = True if sort_by_date_direction == "DESC" else False
            sorted_sales_submissions = sorted(
                sales_submissions,
                key=lambda x: map_of_sales_submission_ids_to_timestamps[x.id],
                reverse=reverse,
            )
            queryset = sorted_sales_submissions

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def filter_by_status(self, queryset, search_type, search_terms, user):
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

        if not user.is_government and SalesSubmissionStatuses.SUBMITTED.value in mapped_search_terms:
            statuses_to_add = [
                SalesSubmissionStatuses.CHECKED.value,
                SalesSubmissionStatuses.RECOMMEND_APPROVAL.value,
                SalesSubmissionStatuses.RECOMMEND_REJECTION.value
            ]
            mapped_search_terms.extend(statuses_to_add)

        final_q = get_search_q_object(
            mapped_search_terms,
            "exact",
            "validation_status",
            [Q(id=-1)] if contains_unmapped_search_term else [],
        )

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

    @action(detail=True, methods=['post'])
    def content(self, request, pk):
        filters = request.data.get('filters')
        page_size = request.data.get('page_size', 100)
        page = request.data.get('page', 1)
        sorts = request.data.get('sorts')
        verify_with_icbc_data = True if request.data.get('reset') == 'Y' else False
        include_71_errors = True if request.data.get('include_71_errors') == 'Y' else False

        # only government should be able to view the contents for icbc
        # verification
        if not request.user.is_government:
            return HttpResponseForbidden()

        submission_content = SalesSubmissionContent.objects.filter(
            submission_id=pk
        ).select_related("submission")

        if verify_with_icbc_data is True:
            warnings_and_maps = get_warnings_and_maps(submission_content, include_71_errors)
            contents_to_save = []

            for content in submission_content:
                content_id = content.id
                warnings = warnings_and_maps["warnings"].get(content_id)
                if warnings:
                    content.warnings_list = ",".join(warnings)
                else:
                    content.warnings_list = None
                contents_to_save.append(content)
            
            SalesSubmissionContent.objects.bulk_update(contents_to_save, ["warnings_list"])
        else:
            warnings_and_maps = {}
            warnings_map = {}
            for content in submission_content:
                content_id = content.id
                warnings = content.warnings_list
                if warnings is not None:
                    warnings_map[content_id] = warnings.split(",")
            helping_objects = get_helping_objects(submission_content)
            warnings_and_maps["warnings"] = warnings_map
            warnings_and_maps["map_of_vins_to_icbc_data"] = helping_objects["map_of_vins_to_icbc_data"]
            warnings_and_maps["map_of_sales_submission_content_ids_to_vehicles"] = helping_objects["map_of_sales_submission_content_ids_to_vehicles"]

        try:
            page = int(page)
        except:
            page = 1

        if page < 1:
            page = 1

        extra_filter_by = []
        extra_filter_params = []

        include_overrides = False
        for filter in filters:
            if filter.get("id") == 'include_overrides' and filter.get("value") is True:
                include_overrides = True
                break

        map_of_warnings_to_content_ids = get_inverse_map(warnings_and_maps.get('warnings'))

        for filter in filters:
            filter_id = filter.get("id")
            value = filter.get("value")

            if filter_id == 'xls_make':
                submission_content = submission_content.filter(
                    xls_make__icontains=value
                )

            elif filter_id == 'xls_model':
                submission_content = submission_content.filter(
                    xls_model__icontains=value
                )

            elif filter_id == 'xls_model_year':
                submission_content = submission_content.filter(
                    xls_model_year__icontains=value
                )

            elif filter_id == 'xls_vin':
                submission_content = submission_content.filter(
                    xls_vin__icontains=value
                )

            elif filter_id == 'warning':
                q_obj = Q(id__in=[])

                if value == '1':
                    q_obj = Q(id__in=warnings_and_maps.get('warnings').keys())

                elif value == '11':
                    q_obj = Q(id__in=map_of_warnings_to_content_ids.get("NO_ICBC_MATCH", []))

                elif value == '21':
                    q_obj = Q(id__in=map_of_warnings_to_content_ids.get("VIN_ALREADY_AWARDED", []))

                elif value == '31':
                    q_obj = Q(id__in=map_of_warnings_to_content_ids.get("DUPLICATE_VIN", []))

                elif value == '41':
                    q_obj = Q(id__in=map_of_warnings_to_content_ids.get("INVALID_MODEL", [])) | Q(id__in=map_of_warnings_to_content_ids.get("MODEL_YEAR_MISMATCHED", [])) | Q(id__in=map_of_warnings_to_content_ids.get("MAKE_MISMATCHED", []))

                elif value == '51':
                    q_obj = Q(id__in=map_of_warnings_to_content_ids.get("EXPIRED_REGISTRATION_DATE", []))

                elif value == '61':
                    q_obj = Q(id__in=map_of_warnings_to_content_ids.get("INVALID_DATE", []))

                elif value == '71':
                    q_obj = Q(id__in=map_of_warnings_to_content_ids.get("WRONG_MODEL_YEAR", []))

                if include_overrides is True:
                    q_obj = q_obj | Q(reason__isnull=False)

                submission_content = submission_content.filter(q_obj)

            elif filter_id == 'model_year.description':
                extra_filter_by.append('UPPER(model_year.description) LIKE %s')
                string = value.replace('%', '')
                extra_filter_params.append('%' + string.upper() + '%')

            elif filter_id == 'icbc_vehicle.make':
                extra_filter_by.append('UPPER(icbc_vehicle.make) LIKE %s')
                string = value.replace('%', '')
                extra_filter_params.append('%' + string.upper() + '%')

            elif filter_id == 'icbc_vehicle.model_name':
                extra_filter_by.append('UPPER(icbc_vehicle.model_name) LIKE %s')
                string = value.replace('%', '')
                extra_filter_params.append('%' + string.upper() + '%')

        extra_order_by = []

        if sorts:
            order_by = []
            for sort in sorts:
                sort_id = sort.get("id")
                desc = sort.get("desc")
                sort_string = "-" + sort_id if desc is True else sort_id
                if sort_string in [
                    'model_year.description',
                    '-model_year.description',
                    'icbc_vehicle.make',
                    '-icbc_vehicle.make',
                    'icbc_vehicle.model_name',
                    '-icbc_vehicle.model_name'
                ]:
                    extra_order_by.append(sort_string)
                if sort_string in [
                    'xls_make', 'xls_model', 'xls_model_year',
                    'xls_sale_date', 'xls_vin',
                    '-xls_make', '-xls_model', '-xls_model_year',
                    '-xls_sale_date', '-xls_vin'
                ]:
                    order_by.append(sort_string)

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

        serializer = SalesSubmissionContentBulkSerializer(
            paginated, many=True, read_only=True, context={'request': request, 'warnings_and_maps': warnings_and_maps}
        )

        errorList = []
        list_of_warnings = list(warnings_and_maps.get('warnings').values())
        if list_of_warnings:
            errorList = list(np.concatenate(list_of_warnings))
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
            if error == 'WRONG_MODEL_YEAR':
                newErrorList.append('WRONG_MODEL_YEAR')
            else:
                pass
        errorKey, errorCounts = np.unique(newErrorList, return_counts=True)
        errorDict = dict(zip(errorKey, errorCounts))
        errorDict.update({"TOTAL": sum(list(errorCounts))})
        return Response({
            'content': serializer.data,
            'count': submission_content_paginator.count,
            'errors': errorDict
        })

    @action(detail=True)
    def unselected(self, request, pk):
        if not request.user.is_government:
            return HttpResponseForbidden()
        
        verify_with_icbc_data = True if request.GET.get('reset') == 'Y' else False
        include_71_errors = True if request.GET.get('include71Errors') == 'Y' else False
        
        if verify_with_icbc_data is True:
            submission_content = SalesSubmissionContent.objects.filter(
                submission_id=pk
            ).select_related("submission")

            warnings_map = get_warnings_and_maps(submission_content, include_71_errors)["warnings"]
            content_ids_to_include = []
            for content_id, warnings in warnings_map.items():
                if "DUPLICATE_VIN" in warnings or "VIN_ALREADY_AWARDED" in warnings or "EXPIRED_REGISTRATION_DATE" in warnings or "NO_ICBC_MATCH" in warnings or "WRONG_MODEL_YEAR" in warnings:
                    content_ids_to_include.append(content_id)
            
            unselected_vins = SalesSubmissionContent.objects.filter(
                submission_id=pk
            ).filter(id__in=content_ids_to_include).values_list('id', flat=True)

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
            serializer = SalesSubmissionCommentSerializer(comment, data={'comment': comment_text}, context={'request': request}, partial=True)
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

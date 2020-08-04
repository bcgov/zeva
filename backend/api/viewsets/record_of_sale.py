"""
Record of Sale Viewset
"""
import json

from datetime import datetime
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny

from api.models.record_of_sale import RecordOfSale
from api.models.record_of_sale_statuses import RecordOfSaleStatuses
from api.serializers.record_of_sale import RecordOfSaleSerializer
from api.services.sales_spreadsheet import create_sales_spreadsheet, \
    ingest_sales_spreadsheet, validate_spreadsheet
from auditable.views import AuditableMixin


class RecordOfSaleViewset(
        AuditableMixin, viewsets.GenericViewSet, mixins.ListModelMixin,
        mixins.RetrieveModelMixin, mixins.UpdateModelMixin
):
    """
    Record of Sale Viewset for downloading the template and uploading the
    sales information
    """
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post']

    def get_queryset(self):
        user = self.request.user

        if user.organization.is_government:
            qs = RecordOfSale.objects.exclude(validation_status__in=(
                RecordOfSaleStatuses.DRAFT,
                RecordOfSaleStatuses.NEW
            )).order_by('id')
        else:
            qs = RecordOfSale.objects.filter(
                submission__organization=user.organization
            ).order_by('id')

        return qs

    serializer_classes = {
        'default': RecordOfSaleSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

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

        try:
            validate_spreadsheet(request)

            print(request.FILES['files'])
            data = request.FILES['files'].read()
            print(data)

            jsondata = {}

            if data:
                result = ingest_sales_spreadsheet(data, requesting_user=user)
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

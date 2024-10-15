from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from api.paginations import BasicPagination
from api.permissions.sales_forecast import SalesForecastPermissions
from api.permissions.same_organization import SameOrganizationPermissions
from api.models.model_year_report import ModelYearReport
from api.services.sales_forecast import (
    update_or_create,
    delete_records,
    create_records,
    get_forecast_records_qs,
    get_forecast,
    get_minio_template_url,
)
from api.serializers.sales_forecast import (
    SalesForecastSerializer,
    SalesForecastRecordSerializer,
)


class SalesForecastViewset(viewsets.GenericViewSet):
    permission_classes = [SameOrganizationPermissions & SalesForecastPermissions]
    same_org_permissions_context = {
        "default_manager": ModelYearReport.objects,
        "default_path_to_org": ("organization",),
    }
    http_method_names = ['get', 'post']
    pagination_class = BasicPagination

    # pk should be a myr_id
    @action(detail=True, methods=["post"])
    def save(self, request, pk=None):
        user = request.user
        data = request.data
        forecast_records = data.pop("forecast_records")
        forecast = update_or_create(pk, user, data)
        if forecast_records:
            delete_records(forecast)
            create_records(forecast, forecast_records, user)
        return Response(status=status.HTTP_201_CREATED)

    # pk should be a myr id
    @action(detail=True)
    def records(self, request, pk=None):
        qs = get_forecast_records_qs(pk)
        page = self.paginate_queryset(qs)
        serializer = SalesForecastRecordSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    # pk should be a myr id
    @action(detail=True)
    def totals(self, request, pk=None):
        forecast = get_forecast(pk)
        serializer = SalesForecastSerializer(forecast)
        return Response(serializer.data)

    @action(detail=False)
    def template_url(self, request):
        return Response({"url": get_minio_template_url()})

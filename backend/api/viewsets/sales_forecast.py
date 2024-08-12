from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from api.paginations import BasicPagination
from api.permissions.sales_forecast import SalesForecastPermissions
from api.services.sales_forecast import (
    deactivate,
    create,
    get_forecast_records_qs,
    get_forecast,
    get_minio_template_url,
)
from api.serializers.sales_forecast import (
    SalesForecastSerializer,
    SalesForecastRecordSerializer,
)


class SalesForecastViewset(viewsets.GenericViewSet):
    permission_classes = [SalesForecastPermissions]
    pagination_class = BasicPagination

    # pk should be a myr_id
    @action(detail=True, methods=["post"])
    def save(self, request, pk=None):
        user = request.user
        deactivate(pk, user)
        data = request.data
        forecast_records = data.pop("forecast_records")
        create(pk, forecast_records, user, **data)
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
        if forecast is None:
            return Response({})
        serializer = SalesForecastSerializer(forecast)
        return Response(serializer.data)

    # pk should be a myr id
    @action(detail=True, methods=["delete"])
    def delete(self, request, pk=None):
        deactivate(pk, request.user)
        return Response(status=status.HTTP_200_OK)

    @action(detail=False)
    def template_url(self, request):
        return Response({"url": get_minio_template_url()})

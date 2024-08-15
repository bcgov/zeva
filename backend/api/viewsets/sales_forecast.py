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
from api.services.minio import minio_put_object
import uuid

class SalesForecastViewset(viewsets.GenericViewSet):
    permission_classes = [SalesForecastPermissions]
    pagination_class = BasicPagination

    # pk should be a myr_id
    @action(detail=True, methods=["post"])
    def save(self, request, pk=None):
        self.action = 'save'
        user = request.user
        deactivate(pk, user)
        data = request.data
        forecast_records = data.pop("forecast_records")
        created_records = create(pk, forecast_records, user, **data)
        serializer = SalesForecastRecordSerializer(created_records, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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

    @action(detail=True, methods=['get'])
    def minio_url(self, request, pk=None):
        object_name = uuid.uuid4().hex
        url = minio_put_object(object_name)
        return Response({
            'url': url,
            'minio_object_name': object_name
        })
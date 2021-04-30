import uuid

from django.utils.decorators import method_decorator

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
import datetime

from django.db.models import Q
import xlrd
from api.models.sales_submission import SalesSubmission

from api.decorators.permission import permission_required
from api.models.vehicle_class import VehicleClass
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle, VehicleDefinitionStatuses
from api.models.vehicle_zev_type import ZevType
from api.permissions.vehicle import VehiclePermissions
from api.serializers.vehicle import ModelYearSerializer, \
    VehicleZevTypeSerializer, VehicleClassSerializer, \
    VehicleSaveSerializer, VehicleSerializer, \
    VehicleStatusChangeSerializer, VehicleIsActiveChangeSerializer, \
    VehicleSalesSerializer
from api.services.minio import minio_put_object
from api.models.sales_submission_content import SalesSubmissionContent
from auditable.views import AuditableMixin


class VehicleViewSet(
    AuditableMixin, viewsets.GenericViewSet, mixins.CreateModelMixin,
    mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin
):
    permission_classes = (VehiclePermissions,)
    http_method_names = ['get', 'post', 'put', 'patch']
    queryset = Vehicle.objects.all()

    serializer_classes = {
        'default': VehicleSerializer,
        'state_change': VehicleStatusChangeSerializer,
        'is_active_change': VehicleIsActiveChangeSerializer,
        'create': VehicleSaveSerializer,
        'partial_update': VehicleSaveSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    def get_queryset(self):
        request = self.request

        queryset = Vehicle.objects.filter(
            organization_id=request.user.organization.id
        )

        if request.user.is_government:
            queryset = Vehicle.objects.filter(
                validation_status__in=[
                    VehicleDefinitionStatuses.SUBMITTED,
                    VehicleDefinitionStatuses.VALIDATED,
                    VehicleDefinitionStatuses.REJECTED,
                    VehicleDefinitionStatuses.CHANGES_REQUESTED
                ]
            )

            organization_id = request.query_params.get('organization_id', None)

            if organization_id:
                queryset = queryset.filter(organization_id=organization_id)

        return queryset

    @method_decorator(permission_required('VIEW_ZEV'))
    def list(self, request):
        """
        Get all the organizations
        """
        vehicles = self.get_queryset()

        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def zev_types(self, _request):
        """
        Get the types
        """
        zev_types = ZevType.objects.all().order_by('description')

        serializer = VehicleZevTypeSerializer(zev_types, many=True)
        return Response(serializer.data)

    @action(detail=False)	
    def classes(self, _request):
        """
        Get the zev classes
        """
        classes = VehicleClass.objects.all().order_by('description')
        serializer = VehicleClassSerializer(classes, many=True)
        return Response(serializer.data)

    @action(detail=True)
    def vehicles_sales(self, _request, *args, **kwargs):
        report_year = int(kwargs.pop('pk'))
        organization_id = _request.user.organization.id
        org_submission = SalesSubmission.objects.filter(
            organization_id=organization_id)
        from_date = (report_year-1, 10, 1,)
        to_date = (report_year, 9, 30,)

        sales_from_date = xlrd.xldate.xldate_from_date_tuple(from_date, 0)
        sales_to_date = xlrd.xldate.xldate_from_date_tuple(to_date, 0)
        sales = SalesSubmissionContent.objects.values(
            'xls_make', 'xls_model', 'xls_model_year'
        ).filter(
            Q(Q(
                Q(xls_sale_date__lte=sales_to_date) &
                Q(xls_sale_date__gte=sales_from_date) &
                Q(xls_date_type="3") &
                ~Q(xls_sale_date="")
            ) |
              Q(
                Q(xls_sale_date__lte=str(report_year) + "-09-30") &
                Q(xls_sale_date__gte=str(report_year-1) + "-10-01") &
                Q(xls_date_type="1") &
                ~Q(xls_sale_date="")
              )
            )
            ).filter(submission__in=org_submission)

        vehicles = Vehicle.objects.none()
        for sale in sales:
            model_year = ModelYear.objects.get(name=sale['xls_model_year'][0:4])
            vehicles |= Vehicle.objects.filter(
                make=sale['xls_make'],
                model_name=sale['xls_model'],
                model_year=model_year)

        serializer = VehicleSalesSerializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def years(self, _request):
        """
        Get the years
        """
        exclude_years = ['2017', '2018']
        years = ModelYear.objects.all().order_by('-name').exclude(name__in=exclude_years)
        serializer = ModelYearSerializer(years, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def is_active_change(self, request, pk=None):
        """
        change active / inactive status for vehicle
        """
        serializer = self.get_serializer(
            self.queryset.get(id=pk),
            data=request.data
        )

        if not serializer.is_valid(raise_exception=True):
            return Response(serializer.errors)

        serializer.save()

        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def state_change(self, request, pk=None):
        """
        Update the state of a vehicle
        """
        serializer = self.get_serializer(
            self.queryset.get(id=pk),
            data=request.data
        )

        if not serializer.is_valid(raise_exception=True):
            return Response(serializer.errors)

        serializer.save()

        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def minio_url(self, request, pk=None):
        object_name = uuid.uuid4().hex
        url = minio_put_object(object_name)

        return Response({
            'url': url,
            'minio_object_name': object_name
        })

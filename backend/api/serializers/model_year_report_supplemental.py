from enumfields.drf import EnumField
from rest_framework.serializers import ModelSerializer, SlugRelatedField, SerializerMethodField

from api.models.supplemental_report import SupplementalReport
from api.models.supplemental_report_sales import SupplementalReportSales
from api.models.supplemental_report_statuses import SupplementalReportStatuses
from api.models.model_year_report_address import ModelYearReportAddress
from api.serializers.organization_address import OrganizationAddressSerializer
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.serializers.model_year_report_vehicle import ModelYearReportVehicleSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.models.vehicle_zev_type import ZevType
from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass

class ModelYearReportSupplementalSerializer(ModelSerializer):
    status = EnumField(SupplementalReportStatuses)
    
    class Meta:
        model = SupplementalReport
        fields = (
            'id', 'status'
        )

class ModelYearReportSupplementalSales(ModelSerializer):
    zev_class = SlugRelatedField(
        slug_field='credit_class',
        queryset=CreditClass.objects.all()
    )
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    vehicle_zev_type = SlugRelatedField(
        slug_field='vehicle_zev_code',
        queryset=ZevType.objects.all()
    )

    class Meta:
        model = SupplementalReportSales
        fields = (
            'id', 'sales', 'make', 'model_name',
            'range', 'zev_class', 'model_year', 'vehicle_zev_type','update_timestamp',
        )

class ModelYearReportSupplementalSupplierSerializer(ModelSerializer):
    assessment_data = SerializerMethodField()
    status = SerializerMethodField()
    zev_sales = SerializerMethodField()

    def get_zev_sales(self, obj):
        sales_queryset = ModelYearReportVehicle.objects.filter(
            model_year_report_id=obj.id
        )
        sales_serializer = ModelYearReportVehicleSerializer(sales_queryset, many=True)

        return sales_serializer.data
    

    def get_status(self, obj):
        if obj.supplemental:
            supp_status = ModelYearReportSupplementalSerializer(obj.supplemental)
            return supp_status.data
        else:
            return None

    def get_assessment_data(self, obj):

        report = ModelYearReport.objects.get(
            id=obj.id
        )

        model_year_serializer = ModelYearSerializer(report.model_year)


        if report.supplier_class == 'S':
            supplier_size = 'Small Volume Supplier'
        elif report.supplier_class == 'M':
            supplier_size = 'Medium Volume Supplier'
        else:
            supplier_size = 'Large Volume Supplier'

        address_queryset = ModelYearReportAddress.objects.filter(
            model_year_report_id=obj.id
         )
        address_serializer = OrganizationAddressSerializer(address_queryset, many=True)
        makes_list = []
        makes_queryset = ModelYearReportMake.objects.filter(
            model_year_report_id=obj.id
        )

        for each in makes_queryset:
            makes_list.append(each.make)
        return {
            'legal_name': report.organization_name,
            'supplier_class': supplier_size,
            'report_address': address_serializer.data,
            'makes': makes_list,
            'model_year': model_year_serializer.data['name']

        }

    class Meta:
        model = ModelYearReport
        fields = (
            'id', 'assessment_data', 'status', 'zev_sales'
        )

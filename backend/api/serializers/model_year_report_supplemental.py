from enumfields.drf import EnumField
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.supplemental_report import SupplementalReport
from api.models.supplemental_report_statuses import SupplementalReportStatuses
from api.models.model_year_report_address import ModelYearReportAddress
from api.serializers.organization_address import OrganizationAddressSerializer
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_make import ModelYearReportMake
from api.models.supplemental_report_credit_activity import \
    SupplementalReportCreditActivity
from api.serializers.vehicle import ModelYearSerializer


class ModelYearReportSupplementalCreditActivitySerializer(ModelSerializer):
    model_year = ModelYearSerializer()

    class Meta:
        model = SupplementalReportCreditActivity
        fields = (
            'id', 'credit_a_value', 'credit_b_value', 'category',
            'model_year'
        )


class ModelYearReportSupplementalSerializer(ModelSerializer):
    status = EnumField(SupplementalReportStatuses)
    credit_activity = SerializerMethodField()

    def get_credit_activity(self, obj):
        activity = SupplementalReportCreditActivity.objects.filter(
            supplemental_report_id=obj.id
        )

        serializer = ModelYearReportSupplementalCreditActivitySerializer(
            activity, many=True
        )

        return serializer.data

    class Meta:
        model = SupplementalReport
        fields = (
            'id', 'status', 'ldv_sales', 'credit_activity',
        )


class ModelYearReportSupplementalSupplierSerializer(ModelSerializer):
    assessment_data = SerializerMethodField()
    status = SerializerMethodField()

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
            'id', 'assessment_data', 'status'
        )

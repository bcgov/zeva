from enumfields.drf import EnumField
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField

from api.models.supplemental_report import SupplementalReport
from api.models.supplemental_report_sales import SupplementalReportSales
from api.models.supplemental_report_statuses import SupplementalReportStatuses
from api.models.model_year_report_address import ModelYearReportAddress
from api.serializers.organization_address import OrganizationAddressSerializer
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_make import ModelYearReportMake
from api.models.supplemental_report_credit_activity import \
    SupplementalReportCreditActivity
from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.models.supplemental_report_attachment import SupplementalReportAttachment
from api.serializers.model_year_report_vehicle import ModelYearReportVehicleSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.models.vehicle_zev_type import ZevType
from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass
from api.models.supplemental_report_comment import \
    SupplementalReportComment
from api.services.minio import minio_get_object
from api.models.supplemental_report_supplier_information import \
    SupplementalReportSupplierInformation


class ModelYearReportZevSalesSerializer(ModelSerializer):
    class Meta:
        model = SupplementalReportSales
        fields = '__all__'


class ModelYearReportSupplementalCreditActivitySerializer(ModelSerializer):
    model_year = ModelYearSerializer()

    class Meta:
        model = SupplementalReportCreditActivity
        fields = (
            'id', 'credit_a_value', 'credit_b_value', 'category',
            'model_year'
        )

class ModelYearReportSupplementalCommentSerializer(ModelSerializer):
    class Meta:
        model = SupplementalReportComment
        fields = (
            'id', 'comment', 'create_timestamp', 'create_user', 'to_govt'
        )
        read_only_fields = (
            'id',
        )

class ModelYearReportSupplementalAttachmentSerializer(ModelSerializer):
    """
    Readonly Serializer for attachments
    """
    url = SerializerMethodField()

    def get_url(self, obj):
        try:
            object_name = obj.minio_object_name

            url = minio_get_object(object_name)

            return url

        except TypeError:
            raise ImproperlyConfigured(
                "Minio is not properly configured for this server."
            )

    class Meta:
        model = SupplementalReportAttachment
        fields = (
            'id', 'mime_type', 'size', 'filename', 'minio_object_name',
            'is_removed', 'url',
        )
        read_only_fields = (
            'id', 'is_removed', 'url',
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
    class Meta:
        model = SupplementalReportSupplierInformation
        fields = (
            'category', 'value'
        )


class ModelYearReportSupplementalSerializer(ModelSerializer):
    status = EnumField(SupplementalReportStatuses)
    credit_activity = SerializerMethodField()
    supplier_information = SerializerMethodField()
    assessment_data = SerializerMethodField()
    zev_sales = SerializerMethodField()
    attachments = SerializerMethodField()
    comments = SerializerMethodField()

    def get_comments(self, obj):
        comments = SupplementalReportComment.objects.filter(
            supplemental_report_id=obj.id
        ).order_by('-create_timestamp')

        if comments.exists():
            serializer = ModelYearReportSupplementalCommentSerializer(comments, many=True)
            return serializer.data

        return None

    def get_attachments(self, obj):
        attachments = SupplementalReportAttachment.objects.filter(
            supplemental_report_id=obj.id,
            is_removed=False)

        serializer = ModelYearReportSupplementalAttachmentSerializer(attachments, many=True)

        return serializer.data

    def get_supplier_information(self, obj):
        supplier_info = SupplementalReportSupplierInformation.objects.filter(
            supplemental_report_id=obj.id
        )

        serializer = ModelYearReportSupplementalSupplierSerializer(
            supplier_info,
            many=True
        )

        return serializer.data

    def get_zev_sales(self, obj):
        sales_queryset = SupplementalReportSales.objects.filter(
            supplemental_report_id=obj.id
        )
        sales_serializer = ModelYearReportZevSalesSerializer(sales_queryset, many=True)

        return sales_serializer.data

    def get_assessment_data(self, obj):
        report = ModelYearReport.objects.get(
            id=obj.model_year_report_id
        )

        model_year_serializer = ModelYearSerializer(report.model_year)

        if report.supplier_class == 'S':
            supplier_size = 'Small Volume Supplier'
        elif report.supplier_class == 'M':
            supplier_size = 'Medium Volume Supplier'
        else:
            supplier_size = 'Large Volume Supplier'

        address_queryset = ModelYearReportAddress.objects.filter(
            model_year_report_id=report.id
         )
        address_serializer = OrganizationAddressSerializer(
            address_queryset, many=True
        )
        makes_list = []
        makes_queryset = ModelYearReportMake.objects.filter(
            model_year_report_id=report.id
        )

        for each in makes_queryset:
            makes_list.append(each.make)
        sales_queryset = ModelYearReportVehicle.objects.filter(
            model_year_report_id=obj.model_year_report_id
            )
        sales_serializer = ModelYearReportVehicleSerializer(sales_queryset, many=True)
        return {
            'legal_name': report.organization_name,
            'supplier_class': supplier_size,
            'report_address': address_serializer.data,
            'makes': makes_list,
            'model_year': model_year_serializer.data['name'],
            'zev_sales': sales_serializer.data

        }

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
            'assessment_data', 'zev_sales', 'supplier_information','attachments','comments'
        )

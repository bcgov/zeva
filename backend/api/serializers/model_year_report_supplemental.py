from django.core.exceptions import ImproperlyConfigured
from enumfields.drf import EnumField
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField

from api.models.supplemental_report import SupplementalReport
from api.models.supplemental_report_sales import SupplementalReportSales
from api.models.model_year_report_address import ModelYearReportAddress
from api.serializers.organization_address import OrganizationAddressSerializer
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_make import ModelYearReportMake
from api.models.supplemental_report_credit_activity import \
    SupplementalReportCreditActivity
from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.models.supplemental_report_attachment import SupplementalReportAttachment
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.serializers.model_year_report_vehicle import ModelYearReportVehicleSerializer
from api.models.model_year_report_assessment_descriptions import ModelYearReportAssessmentDescriptions
from api.serializers.model_year_report_assessment import ModelYearReportAssessmentDescriptionsSerializer
from api.models.supplemental_report_assessment import SupplementalReportAssessment
from api.models.supplemental_report_assessment_comment import SupplementalReportAssessmentComment
from api.serializers.vehicle import ModelYearSerializer
from api.models.vehicle_zev_type import ZevType
from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass
from api.models.supplemental_report_comment import \
    SupplementalReportComment
from api.services.minio import minio_get_object
from api.models.user_profile import UserProfile
from api.models.supplemental_report_supplier_information import \
    SupplementalReportSupplierInformation
from api.mixins.user_mixin import UserSerializerMixin

class ModelYearReportZevSalesSerializer(UserSerializerMixin):

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


class ModelYearReportSupplementalCommentSerializer(UserSerializerMixin):

    class Meta:
        model = SupplementalReportComment
        fields = (
            'id', 'comment', 'create_timestamp', 'create_user', 'to_govt'
        )
        read_only_fields = (
            'id',
        )


class SupplementalReportAssessmentCommentSerializer(UserSerializerMixin):
    """
    Serializer for supplemental report assessment comments
    """

    class Meta:
        model = SupplementalReportAssessmentComment
        fields = (
            'id', 'comment', 'create_timestamp', 'update_timestamp', 'create_user', 'to_director'
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
            'range', 'zev_class', 'model_year', 'vehicle_zev_type',
            'update_timestamp',
        )


class ModelYearReportSupplementalSupplierSerializer(ModelSerializer):
    class Meta:
        model = SupplementalReportSupplierInformation
        fields = (
            'category', 'value'
        )


class SupplementalReportAssessmentSerializer(
        ModelSerializer
):
    assessment_comment = SerializerMethodField()
    assessment = SerializerMethodField()
    descriptions = SerializerMethodField()

    def get_descriptions(self, obj):
        descriptions = ModelYearReportAssessmentDescriptions.objects.filter()
        serializer = ModelYearReportAssessmentDescriptionsSerializer(
            descriptions,
            read_only=True,
            many=True,
            )
        return serializer.data

    def get_assessment(self, obj):
        assessment = SupplementalReportAssessment.objects.filter(
            supplemental_report_id=obj
        ).first()

        if not assessment:
            return {
                'decision': {'id': None, 'description': None},
                'penalty': None,
                'in_compliance': ''
            }
        description_serializer = ModelYearReportAssessmentDescriptionsSerializer(
            assessment.supplemental_report_assessment_description,
            read_only=True,
            )

        return {
            'decision': {
                'description': description_serializer.data['description'],
                'id': description_serializer.data['id']
            },
            'penalty': assessment.penalty,
            'deficit': '',
            'in_compliance': ''
        }

    def get_assessment_comment(self, obj):
        request = self.context.get('request')
        assessment_comment = SupplementalReportAssessmentComment.objects.filter(
            supplemental_report_id=obj
        ).order_by('-create_timestamp')

        if not request.user.is_government:
            assessment_comment = SupplementalReportAssessmentComment.objects.filter(
                supplemental_report_id=obj,
                to_director=False
            ).order_by('-create_timestamp')
        if not assessment_comment:
            return []
        serializer = SupplementalReportAssessmentCommentSerializer(
            assessment_comment, read_only=True, many=True, context={'request': request}
        )
        return serializer.data

    class Meta:
        model = SupplementalReport
        fields = (
            'id', 'assessment_comment',
            'assessment', 'descriptions'
        )


class ModelYearReportSupplementalSerializer(UserSerializerMixin):
    status = EnumField(ModelYearReportStatuses)
    credit_activity = SerializerMethodField()
    supplier_information = SerializerMethodField()
    assessment_data = SerializerMethodField()
    zev_sales = SerializerMethodField()
    attachments = SerializerMethodField()
    from_supplier_comments = SerializerMethodField()
    actual_status = SerializerMethodField()
    reassessment = SerializerMethodField()

    def get_reassessment(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user and user.is_government:
            supplementary_report = SupplementalReport.objects.filter(
                model_year_report_id=obj.model_year_report_id,
                supplemental_id=obj.supplemental_id
            ).first()

            supplemental_user = None

            if supplementary_report.create_user:
                supplemental_user = UserProfile.objects.filter(username=supplementary_report.create_user).first()

            supplementary_report_id = None
            supplementary_report_status = supplementary_report.status.value
            supplementary_report_is_reassessment = False
            if supplemental_user:
                supplementary_report_id = obj.supplemental_id
                supplemental_report = SupplementalReport.objects.filter(
                    model_year_report_id=obj.model_year_report_id,
                    id=obj.supplemental_id
                ).first()
                if supplemental_report:
                    supplementary_report_status = supplemental_report.status.value
                    supplemental_user = UserProfile.objects.filter(username=supplemental_report.create_user).first()

                if supplemental_user.is_government:
                    supplementary_report_is_reassessment = True

            return {
                'is_reassessment': True,
                'supplementary_report_id': supplementary_report_id,
                'status': supplementary_report_status,
                'supplementary_report_is_reassessment': supplementary_report_is_reassessment
            }

        reassessment_report = SupplementalReport.objects.filter(
            model_year_report_id=obj.model_year_report_id,
            supplemental_id=obj.id
        ).first()

        reassessment_report_id = None

        if reassessment_report:
            reassessment_report_id = reassessment_report.id

        # if the reassessment report exists and is not associated with a supplier-created supplementary report, obj.id should be None
        return {
            'is_reassessment': False,
            "supplementary_report_id": obj.id,
            'reassessment_report_id': reassessment_report_id,
            'status': obj.status.value
        }

    def get_actual_status(self, obj):
        request = self.context.get('request')
        # is this a reassessment report? if so this is the actual status
        create_user = UserProfile.objects.filter(username=obj.create_user).first()

        if create_user and create_user.is_government:
            return obj.status.value

        supplemental_report = SupplementalReport.objects.filter(
            model_year_report_id=obj.model_year_report_id,
            supplemental_id=obj.id
        ).exclude(status__in=[ModelYearReportStatuses.DELETED]).order_by('-update_timestamp').first()

        if not supplemental_report:
            return obj.status.value

        if supplemental_report:
            user = UserProfile.objects.filter(username=supplemental_report.create_user).first()

            if user and user.is_government and not request.user.is_government and \
                    supplemental_report.status.value in ['ASSESSED', 'REASSESSED']:
                return supplemental_report.status.value

            if user and user.is_government and request.user.is_government:
                return supplemental_report.status.value

        model_year_report = ModelYearReport.objects.get(id=obj.model_year_report_id)
        latest_supplemental = model_year_report.get_latest_supplemental(request)
        
        if latest_supplemental:
            return latest_supplemental.status.value
        
        return model_year_report.validation_status.value

    def get_from_supplier_comments(self, obj):
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
        request = self.context.get('request')
        sales_queryset = SupplementalReportSales.objects.filter(
            supplemental_report_id=obj.id
        )

        # if not sales_queryset:
        #     sales_queryset = SupplementalReportSales.objects.filter(
        #         supplemental_report_id=obj.supplemental_id
        #     )

        sales_serializer = ModelYearReportZevSalesSerializer(sales_queryset, many=True, context={'request': request})

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
            'zev_sales': sales_serializer.data,
            'credit_reduction_selection': report.credit_reduction_selection
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
            'assessment_data', 'zev_sales', 'supplier_information',
            'attachments', 'from_supplier_comments', 'actual_status',
            'create_user', 'reassessment',
        )

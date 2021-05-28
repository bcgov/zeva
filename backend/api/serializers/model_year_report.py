from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField, CharField, \
    ListField

from api.models.model_year import ModelYear
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_ldv_sales import ModelYearReportLDVSales
from api.models.model_year_report_address import ModelYearReportAddress
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report_ldv_sales import ModelYearReportLDVSales
from api.serializers.model_year_report_ldv_sales import ModelYearReportLDVSalesSerializer
from api.models.user_profile import UserProfile
from api.serializers.model_year_report_address import \
    ModelYearReportAddressSerializer
from api.serializers.model_year_report_make import \
    ModelYearReportMakeSerializer
from api.serializers.model_year_report_history import \
    ModelYearReportHistorySerializer
from api.serializers.user import MemberSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.services.model_year_report import get_model_year_report_statuses


class ModelYearReportSerializer(ModelSerializer):
    create_user = SerializerMethodField()
    model_year = ModelYearSerializer()
    model_year_report_addresses = ModelYearReportAddressSerializer(many=True)
    makes = SerializerMethodField()
    validation_status = EnumField(ModelYearReportStatuses)
    model_year_report_history = ModelYearReportHistorySerializer(many=True)
    confirmations = SerializerMethodField()
    statuses = SerializerMethodField()
    ldv_sales_updated = SerializerMethodField()
    ldv_sales_previous = SerializerMethodField()
    avg_sales = SerializerMethodField()

    def get_ldv_sales_previous(self, obj):
        ldv_sales = ModelYearReportLDVSales.objects.filter(
            model_year_report=obj
        )
        serializer = ModelYearReportLDVSalesSerializer(ldv_sales, many=True)
        return serializer.data

    def get_avg_sales(self, obj):
        rows = ModelYearReportLDVSales.objects.filter(
            model_year_report_id=obj.id
        ).values_list(
            'ldv_sales', flat=True
        )[:3]

        avg_sales = 0
        if rows.count() < 3:
            return None
        avg_sales = sum(list(rows)) / 3
        return avg_sales
    ldv_sales_updated = SerializerMethodField()

    def get_create_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.create_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.create_user

    def get_confirmations(self, obj):
        confirmations = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=obj.id
        ).values_list('signing_authority_assertion_id', flat=True).distinct()

        return confirmations

    def get_ldv_sales_updated(self, obj):
        request = self.context.get('request')

        if request.user.is_government:
            return obj.get_ldv_sales(from_gov=True) or obj.ldv_sales

        return obj.ldv_sales

    def get_makes(self, obj):
        request = self.context.get('request')

        makes = ModelYearReportMake.objects.filter(
            model_year_report_id=obj.id
        )

        if not request.user.is_government:
            makes = makes.filter(
                from_gov=False
            )

        serializer = ModelYearReportMakeSerializer(makes, many=True)

        return serializer.data

    def get_statuses(self, obj):
        return get_model_year_report_statuses(obj)

    class Meta:
        model = ModelYearReport
        fields = (
            'organization_name', 'supplier_class', 'ldv_sales', 'model_year',
            'model_year_report_addresses', 'makes', 'validation_status',
            'create_user', 'model_year_report_history', 'confirmations',
            'statuses', 'ldv_sales_updated','statuses', 
            'ldv_sales_previous', 'avg_sales'
        )


class ModelYearReportListSerializer(
        ModelSerializer, EnumSupportSerializerMixin
):
    model_year = ModelYearSerializer()
    validation_status = SerializerMethodField()
    compliant = SerializerMethodField()
    obligation_total = SerializerMethodField()
    obligation_credits = SerializerMethodField()
    ldv_sales = SerializerMethodField()

    def get_ldv_sales(self, obj):
        return obj.ldv_sales

    def get_compliant(self, obj):
        return True

    def get_obligation_total(self, obj):
        return 0

    def get_obligation_credits(self, obj):
        return 0

    def get_validation_status(self, obj):
        request = self.context.get('request')
        if not request.user.is_government and obj.validation_status is ModelYearReportStatuses.RECOMMENDED:
            return ModelYearReportStatuses.SUBMITTED.value
        return obj.get_validation_status_display()

    class Meta:
        model = ModelYearReport
        fields = (
            'id', 'organization_name', 'model_year', 'validation_status', 'ldv_sales',
            'supplier_class', 'compliant', 'obligation_total',
            'obligation_credits',
        )


class ModelYearReportSaveSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    validation_status = EnumField(
        ModelYearReportStatuses,
        required=False
    )
    makes = ListField(
        child=CharField()
    )

    def create(self, validated_data):
        request = self.context.get('request')
        organization = request.user.organization
        makes = validated_data.pop('makes')
        model_year = validated_data.pop('model_year')
        confirmations = request.data.get('confirmations')
        ldv_sales = request.user.organization.ldv_sales

        report = ModelYearReport.objects.create(
            model_year_id=model_year.id,
            organization_id=organization.id,
            organization_name=organization.name,
            **validated_data,
            create_user=request.user.username,
            update_user=request.user.username,
            supplier_class=request.user.organization.supplier_class
        )
        for each in ldv_sales:
            ModelYearReportLDVSales.objects.create(
                model_year=each.model_year,
                ldv_sales=each.ldv_sales,
                model_year_report=report
            )
        for confirmation in confirmations:
            ModelYearReportConfirmation.objects.create(
                create_user=request.user.username,
                model_year_report=report,
                has_accepted=True,
                title=request.user.title,
                signing_authority_assertion_id=confirmation
            )

        for make in makes:
            ModelYearReportMake.objects.create(
                model_year_report=report,
                make=make,
                create_user=request.user.username,
                update_user=request.user.username,
            )

        for address in request.user.organization.organization_address:
            ModelYearReportAddress.objects.create(
                model_year_report=report,
                representative_name=address.representative_name,
                address_type=address.address_type,
                address_line_1=address.address_line_1,
                address_line_2=address.address_line_2,
                address_line_3=address.address_line_3,
                city=address.city,
                postal_code=address.postal_code,
                state=address.state,
                county=address.county,
                country=address.country,
                other=address.other
            )

        ModelYearReportHistory.objects.create(
            create_user=request.user.username,
            update_user=request.user.username,
            model_year_report_id=report.id,
            validation_status=ModelYearReportStatuses.DRAFT,
        )

        return report

    def update(self, instance, validated_data):
        request = self.context.get('request')
        organization = request.user.organization

        delete_confirmations = request.data.get('delete_confirmations', False)

        if delete_confirmations:
            module = request.data.get('module', None)
            ModelYearReportConfirmation.objects.filter(
                model_year_report=instance,
                signing_authority_assertion__module=module
            ).delete()

            return instance

        makes = validated_data.pop('makes')
        model_year = validated_data.pop('model_year')
        confirmations = request.data.get('confirmations')

        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report=instance,
            signing_authority_assertion__module="supplier_information"
        ).first()

        if confirmation:
            return instance

        instance.model_year_id = model_year.id
        instance.organization_name = organization.name
        instance.update_user = request.user.username

        instance.save()

        if makes:
            ModelYearReportMake.objects.filter(
                model_year_report=instance,
            ).delete()

            for make in makes:
                ModelYearReportMake.objects.create(
                    model_year_report=instance,
                    make=make,
                    create_user=request.user.username,
                    update_user=request.user.username,
                )

        ModelYearReportAddress.objects.filter(
            model_year_report=instance,
        ).delete()

        for address in request.user.organization.organization_address:
            ModelYearReportAddress.objects.create(
                model_year_report=instance,
                representative_name=address.representative_name,
                address_type=address.address_type,
                address_line_1=address.address_line_1,
                address_line_2=address.address_line_2,
                address_line_3=address.address_line_3,
                city=address.city,
                postal_code=address.postal_code,
                state=address.state,
                county=address.county,
                country=address.country,
                other=address.other
            )

        for confirmation in confirmations:
            ModelYearReportConfirmation.objects.update_or_create(
                model_year_report=instance,
                has_accepted=True,
                title=request.user.title,
                signing_authority_assertion_id=confirmation,
                defaults={
                    'create_user': request.user.username
                }
            )

        ModelYearReportHistory.objects.create(
            create_user=request.user.username,
            update_user=request.user.username,
            model_year_report_id=instance.id,
            validation_status=ModelYearReportStatuses.DRAFT,
        )

        return instance

    class Meta:
        model = ModelYearReport
        fields = (
            'id', 'model_year', 'validation_status', 'makes',
        )

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
from api.serializers.model_year_report_ldv_sales import ModelYearReportLDVSalesSerializer
from api.models.user_profile import UserProfile
from api.serializers.model_year_report_address import \
    ModelYearReportAddressSerializer
from api.serializers.model_year_report_make import \
    ModelYearReportMakeSerializer
from api.serializers.model_year_report_history import \
    ModelYearReportHistorySerializer
from api.serializers.model_year_report_adjustment import \
    ModelYearReportAdjustmentSerializer
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
    ldv_sales = SerializerMethodField()
    ldv_sales_previous = SerializerMethodField()
    avg_sales = SerializerMethodField()
    changelog = SerializerMethodField()
    adjustments = ModelYearReportAdjustmentSerializer(many=True)

    def get_ldv_sales_previous(self, obj):
        year = int(obj.model_year.name)
        ldv_sales = ModelYearReportLDVSales.objects.filter(
            model_year_report=obj,
            model_year__name__in=[
                str(year - 1),
                str(year - 2),
                str(year - 3)
            ]
        )
        serializer = ModelYearReportLDVSalesSerializer(ldv_sales, many=True)
        return serializer.data

    def get_avg_sales(self, obj):
        rows = ModelYearReportLDVSales.objects.filter(
            model_year_report_id=obj.id,
            from_gov=False,
            model_year__name__lt=obj.model_year.name
        ).values_list(
            'ldv_sales', flat=True
        )[:3]

        avg_sales = 0
        if rows.count() < 3:
            row = ModelYearReportLDVSales.objects.filter(
                model_year_report_id=obj.id,
                model_year_id=obj.model_year_id
            ).first()
            if row:
                return row.ldv_sales
            else:
                return None
        avg_sales = sum(list(rows)) / 3
        return avg_sales

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

    def get_ldv_sales(self, obj):
        request = self.context.get('request')

        if request.user.is_government:
            return obj.get_ldv_sales(from_gov=True) or obj.ldv_sales

        return obj.ldv_sales

    def get_changelog(self, obj):
        request = self.context.get('request')
        if request.user.is_government:
            from_gov_sales = obj.get_ldv_sales_with_year(from_gov=True)
            sales_changes = ''
            if from_gov_sales:
                not_gov_sales = obj.get_ldv_sales_with_year(from_gov=False)
                sales_changes = {'from_gov': from_gov_sales['sales'], 'not_from_gov': not_gov_sales['sales'], 'year': from_gov_sales['year']}

            gov_makes = ModelYearReportMake.objects.filter(
                model_year_report_id=obj.id,
                from_gov=True
            )
            gov_makes_additions_serializer = ModelYearReportMakeSerializer(gov_makes, many=True)
            return {'makes_additions': gov_makes_additions_serializer.data, 'ldv_changes': sales_changes}
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
            'organization_name', 'supplier_class', 'model_year',
            'model_year_report_addresses', 'makes', 'validation_status',
            'create_user', 'model_year_report_history', 'confirmations',
            'statuses', 'ldv_sales', 'ldv_sales_previous', 'avg_sales',
            'credit_reduction_selection', 'changelog', 'adjustments',
            'update_timestamp',
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
        ldv_sales = request.data.get('ldv_sales')

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
            model_year = ModelYear.objects.filter(
                name=each.get('model_year')
            ).first()

            if model_year:
                ModelYearReportLDVSales.objects.create(
                    model_year=model_year,
                    ldv_sales=each.get('ldv_sales'),
                    model_year_report_id=report.id
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

        ldv_sales = request.data.get('ldv_sales', None)

        if 'ldv_sales' in request.data:
            ModelYearReportLDVSales.objects.filter(
                model_year_report_id=instance.id
            ).exclude(
                model_year_id=instance.model_year_id
            ).delete()

            for each in ldv_sales:
                model_year = ModelYear.objects.filter(
                    name=each.get('model_year')
                ).first()

                if model_year:
                    ModelYearReportLDVSales.objects.create(
                        model_year_id=model_year.id,
                        ldv_sales=each.get('ldv_sales'),
                        model_year_report_id=instance.id
                    )

        if instance.get_avg_sales():
            instance.supplier_class = request.user.organization.get_current_class(
                avg_sales=instance.get_avg_sales()
            )
            instance.save()

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

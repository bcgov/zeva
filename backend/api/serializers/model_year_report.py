from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField, CharField, \
    ListField

from api.models.model_year import ModelYear
from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_address import ModelYearReportAddress
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.user_profile import UserProfile
from api.serializers.model_year_report_address import \
    ModelYearReportAddressSerializer
from api.serializers.model_year_report_make import \
    ModelYearReportMakeSerializer
from api.serializers.model_year_report_history import \
    ModelYearReportHistorySerializer
from api.serializers.user import MemberSerializer
from api.serializers.vehicle import ModelYearSerializer


class ModelYearReportSerializer(ModelSerializer):
    create_user = SerializerMethodField()
    model_year = ModelYearSerializer()
    model_year_report_addresses = ModelYearReportAddressSerializer(many=True)
    makes = ModelYearReportMakeSerializer(many=True)
    validation_status = EnumField(ModelYearReportStatuses)
    model_year_report_history = ModelYearReportHistorySerializer(many=True)
    confirmations = SerializerMethodField()

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

    class Meta:
        model = ModelYearReport
        fields = (
            'organization_name', 'supplier_class', 'ldv_sales', 'model_year',
            'model_year_report_addresses', 'makes', 'validation_status',
            'create_user', 'model_year_report_history', 'confirmations'
        )


class ModelYearReportListSerializer(
        ModelSerializer, EnumSupportSerializerMixin
):
    model_year = ModelYearSerializer()
    validation_status = EnumField(ModelYearReportStatuses)
    compliant = SerializerMethodField()
    obligation_total = SerializerMethodField()
    obligation_credits = SerializerMethodField()

    def get_compliant(self, obj):
        return True

    def get_obligation_total(self, obj):
        return 0

    def get_obligation_credits(self, obj):
        return 0

    class Meta:
        model = ModelYearReport
        fields = (
            'id', 'model_year', 'validation_status', 'ldv_sales',
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

        report = ModelYearReport.objects.create(
            model_year_id=model_year.id,
            organization_id=organization.id,
            organization_name=organization.name,
            **validated_data,
            create_user=request.user.username,
            update_user=request.user.username,
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
            ModelYearReportConfirmation.objects.create(
                create_user=request.user.username,
                model_year_report=instance,
                has_accepted=True,
                title=request.user.title,
                signing_authority_assertion_id=confirmation
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
            'organization_name',
        )

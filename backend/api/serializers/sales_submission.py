from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField
from django.db.models import Subquery
from django.db.models.functions import Upper

from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.record_of_sale import RecordOfSale
from api.models.record_of_sale_statuses import RecordOfSaleStatuses
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.models.sales_submission_comment import SalesSubmissionComment
from api.models.sales_submission_history import SalesSubmissionHistory
from api.models.vehicle import Vehicle
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.serializers.sales_submission_comment import \
    SalesSubmissionCommentSerializer
from api.models.user_profile import UserProfile
from api.models.vehicle import Vehicle
from api.models.vin_statuses import VINStatuses
from api.serializers.user import MemberSerializer
from api.serializers.organization import OrganizationSerializer
from api.serializers.sales_submission_content import \
    SalesSubmissionContentSerializer
from api.services.sales_spreadsheet import get_date


class BaseSerializer():
    def get_update_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.update_user

    def get_create_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.create_user)
        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data
        return obj.create_user

    def get_validation_status(self, obj):
        request = self.context.get('request')

        #  do not show bceid users statuses of CHECKED
        #  CHECKED is really an internal status for IDIR users that someone has
        #  reviewed the vins
        if not request.user.is_government and \
                obj.validation_status in [
                        SalesSubmissionStatuses.CHECKED,
                        SalesSubmissionStatuses.RECOMMEND_APPROVAL,
                        SalesSubmissionStatuses.RECOMMEND_REJECTION
                ]:
            return SalesSubmissionStatuses.SUBMITTED.value

        return obj.get_validation_status_display()


class SalesSubmissionListSerializer(
        ModelSerializer, EnumSupportSerializerMixin, BaseSerializer
):
    organization = OrganizationSerializer(read_only=True)
    total_credits = SerializerMethodField()
    total_warnings = SerializerMethodField()
    totals = SerializerMethodField()
    update_user = SerializerMethodField()
    validation_status = SerializerMethodField()

    def get_total_credits(self, obj):
        total_a = 0
        total_b = 0

        if obj.records.count() > 0:
            for record in obj.get_records_totals_by_vehicles():
                vehicle = Vehicle.objects.filter(
                    id=record['vehicle_id']
                ).first()

                if vehicle:
                    if vehicle.get_credit_class() == 'A':
                        total_a += vehicle.get_credit_value() * record['num_vins']

                    if vehicle.get_credit_class() == 'B':
                        total_b += vehicle.get_credit_value() * record['num_vins']
        else:
            for record in obj.get_content_totals_by_vehicles():
                try:
                    model_year = float(record['xls_model_year'])
                except ValueError:
                    continue

                vehicle = Vehicle.objects.filter(
                    make__iexact=record['xls_make'],
                    model_name=record['xls_model'],
                    model_year__name=int(model_year),
                    validation_status=VehicleDefinitionStatuses.VALIDATED,
                ).first()

                if vehicle:
                    if vehicle.get_credit_class() == 'A':
                        total_a += vehicle.get_credit_value() * record['num_vins']

                    if vehicle.get_credit_class() == 'B':
                        total_b += vehicle.get_credit_value() * record['num_vins']

        return {
            'a': round(total_a, 2),
            'b': round(total_b, 2)
        }

    def get_total_warnings(self, obj):
        request = self.context.get('request')
        warnings = 0

        valid_statuses = [SalesSubmissionStatuses.VALIDATED]

        if request.user.is_government:
            valid_statuses = [
                SalesSubmissionStatuses.CHECKED,
                SalesSubmissionStatuses.RECOMMEND_APPROVAL,
                SalesSubmissionStatuses.RECOMMEND_REJECTION,
                SalesSubmissionStatuses.VALIDATED
            ]

        if obj.validation_status in valid_statuses:
            for row in obj.content.all():
                if len(row.warnings) > 0 and row.record_of_sale is None:
                    warnings += 1

        return warnings

    def get_totals(self, obj):
        return {
            'vins': obj.records.count()
        }

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'validation_status', 'organization', 'submission_date',
            'submission_sequence', 'totals', 'submission_id', 'update_user',
            'total_credits', 'total_warnings', 'unselected',
        )


class SalesSubmissionHistorySerializer(
        ModelSerializer, EnumSupportSerializerMixin, BaseSerializer
):
    create_user = SerializerMethodField()
    update_user = SerializerMethodField()
    validation_status = SerializerMethodField()

    class Meta:
        model = SalesSubmissionHistory
        fields = (
            'create_timestamp', 'create_user',
            'validation_status', 'update_user'
            )


class SalesSubmissionSerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        BaseSerializer
):
    history = SalesSubmissionHistorySerializer(read_only=True, many=True)
    organization = OrganizationSerializer(read_only=True)
    content = SerializerMethodField()
    sales_submission_comment = SerializerMethodField()
    update_user = SerializerMethodField()
    validation_status = SerializerMethodField()
    create_user = SerializerMethodField()

    def get_content(self, instance):
        request = self.context.get('request')

        content = []

        def find(lst, search):
            for index, row in enumerate(lst):
                if row['xls_model'] == search['xls_model'] and \
                        row['xls_make'] == search['xls_make'] and \
                        row['xls_model_year'] == search['xls_model_year']:
                    return index

            return None

        valid_vehicles = Vehicle.objects.filter(
            organization_id=instance.organization_id,
            validation_status=VehicleDefinitionStatuses.VALIDATED
        ).values_list('model_year__name', Upper('make'), 'model_name')

        matched_vins = SalesSubmissionContent.objects.filter(
            submission_id=instance.id,
            xls_vin__in=Subquery(IcbcRegistrationData.objects.values('vin'))
        ).values_list('id', flat=True)

        for row in instance.content:
            warnings = 0

            # if not row.valid_sales_date:
            #     warnings = 1

            if warnings == 0:
                if row.id not in matched_vins:
                    warnings = 1

            try:
                model_year = float(row.xls_model_year)
            except ValueError:
                warnings = 1
                model_year = 0

            if (str(model_year), row.xls_make.upper(), row.xls_model) not in valid_vehicles:
                warnings = 1

            index = find(content, {
                'xls_make': row.xls_make,
                'xls_model': row.xls_model,
                'xls_model_year': row.xls_model_year,
            })

            if index is not None:
                content[index]['sale'] += 1
                content[index]['warnings'] += warnings
            else:
                content.append({
                    'xls_make': row.xls_make,
                    'xls_model': row.xls_model,
                    'xls_model_year': row.xls_model_year,
                    'sale': 1,
                    'warnings':  warnings
                })

        return content

    def get_sales_submission_comment(self, obj):
        sales_submission_comment = SalesSubmissionComment.objects.filter(
            sales_submission=obj
        ).order_by('-create_timestamp')

        if sales_submission_comment.exists():
            serializer = SalesSubmissionCommentSerializer(
                sales_submission_comment, read_only=True, many=True
            )
            return serializer.data

        return None

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'validation_status', 'organization', 'submission_date',
            'submission_sequence', 'content', 'submission_id', 'history',
            'sales_submission_comment', 'update_user', 'unselected',
            'update_timestamp', 'create_user', 'filename', 'create_timestamp'
        )


class SalesSubmissionSaveSerializer(
        ModelSerializer
):
    validation_status = EnumField(SalesSubmissionStatuses)
    sales_submission_comment = SalesSubmissionCommentSerializer(
        allow_null=True,
        required=False
    )

    def validate_validation_status(self, value):
        request = self.context.get('request')
        instance = self.instance

        instance.validate_validation_status(value, request)

        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        records = request.data.get('records')
        sales_submission_comment = validated_data.pop('sales_submission_comment', None)

        if sales_submission_comment:
            SalesSubmissionComment.objects.create(
                create_user=request.user.username,
                sales_submission=instance,
                comment=sales_submission_comment.get('comment')
            )

        if records is not None:
            RecordOfSale.objects.filter(submission_id=instance.id).delete()

            for record_id in records:
                row = SalesSubmissionContent.objects.filter(
                    id=record_id
                ).first()

                if row and row.vehicle:
                    RecordOfSale.objects.create(
                        sale_date=get_date(
                            row.xls_sale_date,
                            row.xls_date_type,
                            row.xls_date_mode
                        ),
                        submission=instance,
                        validation_status=RecordOfSaleStatuses.VALIDATED,
                        vehicle=row.vehicle,
                        vin=row.xls_vin,
                        vin_validation_status=VINStatuses.MATCHED,
                    )

        validation_status = validated_data.get('validation_status')

        if validation_status:
            SalesSubmissionHistory.objects.create(
                submission=instance,
                validation_status=validation_status,
                update_user=request.user.username,
                create_user=request.user.username,
            )
            instance.validation_status = validation_status
            instance.update_user = request.user.username
            instance.save()

        return instance

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'organization', 'submission_date',
            'submission_sequence', 'submission_id',
            'validation_status', 'sales_submission_comment'
        )

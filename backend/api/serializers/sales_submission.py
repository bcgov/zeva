from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.record_of_sale import RecordOfSale
from api.models.record_of_sale_statuses import RecordOfSaleStatuses
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.models.sales_submission_comment import SalesSubmissionComment
from api.serializers.sales_submission_comment import \
    SalesSubmissionCommentSerializer
from api.models.user_profile import UserProfile
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
    total_a_credits = SerializerMethodField()
    total_b_credits = SerializerMethodField()
    total_warnings = SerializerMethodField()
    totals = SerializerMethodField()
    update_user = SerializerMethodField()
    validation_status = SerializerMethodField()

    def get_total_a_credits(self, obj):
        total = 0

        for record in obj.records.all():
            credit_class = record.vehicle.get_credit_class()

            if credit_class == 'A':
                total += record.vehicle.get_credit_value()

        return round(total, 2)

    def get_total_b_credits(self, obj):
        total = 0

        for record in obj.records.all():
            credit_class = record.vehicle.get_credit_class()

            if credit_class == 'B':
                total += record.vehicle.get_credit_value()

        return round(total, 2)

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
                if len(row.warnings) > 0:
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
            'total_a_credits', 'total_b_credits', 'total_warnings',
            'unselected',
        )


class SalesSubmissionSerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        BaseSerializer
):
    organization = OrganizationSerializer(read_only=True)
    content = SerializerMethodField()
    sales_submission_comment = SerializerMethodField()
    update_user = SerializerMethodField()
    validation_status = SerializerMethodField()

    def get_content(self, instance):
        request = self.context.get('request')

        serializer = SalesSubmissionContentSerializer(
            instance.content,
            read_only=True,
            many=True,
            context={'request': request}
        )

        return serializer.data

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
            'submission_sequence', 'content', 'submission_id',
            'sales_submission_comment', 'update_user', 'unselected',
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

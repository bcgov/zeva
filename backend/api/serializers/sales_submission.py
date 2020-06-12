from decimal import Decimal
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, Serializer, IntegerField, CharField

from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer
from api.serializers.organization import OrganizationSerializer
from api.serializers.record_of_sale import RecordOfSaleSerializer


class SalesSubmissionListSerializer(
        ModelSerializer, EnumSupportSerializerMixin
):
    organization = OrganizationSerializer(read_only=True)
    totals = SerializerMethodField()
    update_user = SerializerMethodField()
    validation_status = EnumField(SalesSubmissionStatuses, read_only=True)
    total_a_credits = SerializerMethodField()
    total_b_credits = SerializerMethodField()

    def get_totals(self, obj):
        return {
            'vins': obj.records.count()
        }

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

    def get_update_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.update_user

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'validation_status', 'organization', 'submission_date',
            'submission_sequence', 'totals', 'submission_id', 'update_user',
            'total_a_credits', 'total_b_credits'
        )


class SalesSubmissionSerializer(ModelSerializer, EnumSupportSerializerMixin):
    validation_status = EnumField(SalesSubmissionStatuses, read_only=True)
    organization = OrganizationSerializer(read_only=True)
    records = RecordOfSaleSerializer(read_only=True, many=True)

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'validation_status', 'organization', 'submission_date',
            'submission_sequence', 'records', 'submission_id'
        )


class RecordOfSaleSerializer(Serializer):
    id = IntegerField()
    validation_status = CharField()


class SalesSubmissionSaveSerializer(
    ModelSerializer
):
    records = RecordOfSaleSerializer(many=True)
    validation_status = EnumField(SalesSubmissionStatuses)

    def validate_validation_status(self, value):
        request = self.context.get('request')
        instance = self.instance

        instance.validate_validation_status(value, request)

        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        records = validated_data.get('records')

        if records:
            for record in records:
                record_of_sale = RecordOfSale.objects.get(id=record.get('id'))
                record_of_sale.validation_status = record.get(
                    'validation_status'
                )
                record_of_sale.save()

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
            'submission_sequence', 'records', 'submission_id',
            'validation_status'
        )

from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.user import MemberSerializer
from api.serializers.organization import OrganizationSerializer
from api.serializers.record_of_sale import RecordOfSaleSerializer


class SalesSubmissionListSerializer(
        ModelSerializer, EnumSupportSerializerMixin
):
    organization = OrganizationSerializer(read_only=True)
    totals = SerializerMethodField()
    update_user = MemberSerializer(read_only=True)
    validation_status = EnumField(SalesSubmissionStatuses, read_only=True)

    def get_totals(self, obj):
        return {
            'vins': obj.records.count()
        }

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'validation_status', 'organization', 'submission_date',
            'submission_sequence', 'totals', 'submission_id', 'update_user'
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


class RecordOfSaleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    validation_status = serializers.CharField()


class SalesSubmissionSaveSerializer(
    ModelSerializer
):
    records = RecordOfSaleSerializer(many=True)
    validation_status = EnumField(SalesSubmissionStatuses)

    def update(self, instance, validated_data):
        records = validated_data.get('records')

        if records:
            for record in records:
                record_of_sale = RecordOfSale.objects.get(id=record.get('id'))
                record_of_sale.validation_status = record.get(
                    'validation_status'
                )
                record_of_sale.save()

        return instance

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'organization', 'submission_date',
            'submission_sequence', 'records', 'submission_id',
            'validation_status'
        )

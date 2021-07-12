from rest_framework.serializers import ModelSerializer, SerializerMethodField, SlugRelatedField
from .organization import OrganizationSerializer
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from api.models.credit_agreement import CreditAgreement
from api.serializers.credit_agreement_content import \
    CreditAgreementContentSerializer
from api.models.credit_agreement_statuses import CreditAgreementStatuses
from api.models.credit_agreement_transaction_types import CreditAgreementTransactionTypes

class CreditAgreementSerializer(ModelSerializer):
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = CreditAgreement
        fields = (
            'id', 'organization', 'effective_date', 'transaction_type',
        )

class CreditAgreementSaveSerializer(ModelSerializer, EnumSupportSerializerMixin):
    status = EnumField(
        CreditAgreementStatuses,
        required=False
    )
    transaction_type = EnumField(
        CreditAgreementTransactionTypes,
        required=False
    )

    def create(self, validated_data):
        request = self.context.get('request')
        agreement_details = request.data.get('agreement_details')
        transaction_type = agreement_details.get('transaction_type')
        obj = CreditAgreement.objects.create(
            transaction_type=transaction_type,
            **validated_data
        )
        return obj

    class Meta:
        model = CreditAgreement
        fields = (
            'create_timestamp', 'organization',  'effective_date', 'id',
            'update_user', 'status', 'transaction_type'
        )


class CreditAgreementListSerializer(
        ModelSerializer, EnumSupportSerializerMixin,
):
    history = SerializerMethodField()
    organization = OrganizationSerializer()
    credit_agreement_content = CreditAgreementContentSerializer(
        many=True, read_only=True
    )
    status = SerializerMethodField()
    update_user = SerializerMethodField()

    def get_status(self, obj):
        return obj.get_status_display()

    class Meta:
        model = CreditAgreement
        fields = (
            'create_timestamp', 'organization',  'effective_date',
            'transaction_type', 'credit_agreement_content', 'id',
            'status', 'update_user', 'history',
        )



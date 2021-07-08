from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .organization import OrganizationSerializer
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from api.models.credit_agreement import CreditAgreement
from api.serializers.credit_agreement_content import \
    CreditAgreementContentSerializer


class CreditAgreementSerializer(ModelSerializer):
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = CreditAgreement
        fields = (
            'id', 'organization', 'effective_date', 'transaction_type',
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
            'transaction_type', 'credit_agreement_content','id', 
            'status', 'update_user', 'history',
        )

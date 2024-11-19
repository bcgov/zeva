from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.serializers.signing_authority_assertion import \
    SigningAuthorityAssertionSerializer
from api.mixins.user_mixin import UserSerializerMixin


class ModelYearReportConfirmationSerializer(UserSerializerMixin):
    signing_authority_assertion = SigningAuthorityAssertionSerializer()


    class Meta:
        model = ModelYearReportConfirmation
        fields = (
            'create_timestamp',  'create_user', 'signing_authority_assertion',
        )

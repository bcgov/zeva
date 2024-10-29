from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.serializers.signing_authority_assertion import \
    SigningAuthorityAssertionSerializer
from api.mixins.user_mixin import UserMixin


class ModelYearReportConfirmationSerializer(ModelSerializer, UserMixin):
    create_user = SerializerMethodField()
    signing_authority_assertion = SigningAuthorityAssertionSerializer()


    class Meta:
        model = ModelYearReportConfirmation
        fields = (
            'create_timestamp',  'create_user', 'signing_authority_assertion',
        )

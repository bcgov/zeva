from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.model_year_report_confirmation import \
    ModelYearReportConfirmation
from api.models.user_profile import UserProfile
from api.serializers.user import UserSerializer
from api.serializers.signing_authority_assertion import \
    SigningAuthorityAssertionSerializer


class ModelYearReportConfirmationSerializer(ModelSerializer):
    create_user = SerializerMethodField()
    signing_authority_assertion = SigningAuthorityAssertionSerializer()

    def get_create_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.create_user)
        if user_profile.exists():
            serializer = UserSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.create_user

    class Meta:
        model = ModelYearReportConfirmation
        fields = (
            'create_timestamp',  'create_user', 'signing_authority_assertion',
        )

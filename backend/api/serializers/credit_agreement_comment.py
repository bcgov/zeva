from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField
from api.models.credit_agreement_comment import CreditAgreementComment
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer, UserSerializer


class CreditAgreementCommentSerializer(ModelSerializer):
    """
    Serializer for credit agreement comments
    """
    create_user = SerializerMethodField()

    def get_create_user(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user is None:
            return obj.create_user

        serializer = MemberSerializer(user, read_only=True)
        return serializer.data

    class Meta:
        model = CreditAgreementComment
        fields = (
            'id', 'comment', 'create_timestamp', 'create_user', 'to_director'
        )
        read_only_fields = (
            'id',
        )

"""
Credit Transfer Comment Serializer
"""
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.user_profile import UserProfile
from api.models.credit_transfer_comment import CreditTransferComment
from api.serializers.user import MemberSerializer


class CreditTransferCommentSerializer(ModelSerializer):
    """
    Serializer for Credit Transfer comments
    """
    create_user = SerializerMethodField()

    def get_create_user(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user is None:
            return obj.create_user

        serializer = MemberSerializer(user, read_only=True)
        return serializer.data

    class Meta:
        model = CreditTransferComment
        fields = (
            'id', 'comment', 'create_timestamp', 'update_timestamp', 'create_user',
        )
        read_only_fields = (
            'id',
        )

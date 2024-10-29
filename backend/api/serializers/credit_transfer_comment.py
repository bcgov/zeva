"""
Credit Transfer Comment Serializer
"""
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.user_profile import UserProfile
from api.models.credit_transfer_comment import CreditTransferComment
from api.serializers.user import MemberSerializer
from ..mixins.user_mixin import UserMixin

class CreditTransferCommentSerializer(ModelSerializer, UserMixin):
    """
    Serializer for Credit Transfer comments
    """
    create_user = SerializerMethodField()

    class Meta:
        model = CreditTransferComment
        fields = (
            'id', 'comment', 'create_timestamp', 'update_timestamp', 'create_user',
        )
        read_only_fields = (
            'id',
        )

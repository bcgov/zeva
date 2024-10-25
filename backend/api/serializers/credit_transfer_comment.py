"""
Credit Transfer Comment Serializer
"""
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.user_profile import UserProfile
from api.models.credit_transfer_comment import CreditTransferComment
from api.serializers.user import MemberSerializer
from ..mixins.user_mixin import  get_user_data

class CreditTransferCommentSerializer(ModelSerializer):
    """
    Serializer for Credit Transfer comments
    """
    create_user = SerializerMethodField()

    def get_create_user(self, obj):
        return get_user_data(obj, 'create_user', self.context.get('request'))
    class Meta:
        model = CreditTransferComment
        fields = (
            'id', 'comment', 'create_timestamp', 'update_timestamp', 'create_user',
        )
        read_only_fields = (
            'id',
        )

"""
Credit Transfer Comment Serializer
"""

from api.models.credit_transfer_comment import CreditTransferComment
from api.mixins.user_mixin import UserSerializerMixin

class CreditTransferCommentSerializer(UserSerializerMixin):
    """
    Serializer for Credit Transfer comments
    """

    class Meta:
        model = CreditTransferComment
        fields = (
            'id', 'comment', 'create_timestamp', 'update_timestamp', 'create_user',
        )
        read_only_fields = (
            'id',
        )

"""
Sales Submission Comment Serializer
"""

from api.models.sales_submission_comment import SalesSubmissionComment
from api.mixins.user_mixin import UserSerializerMixin


class SalesSubmissionCommentSerializer(UserSerializerMixin):
    """
    Serializer for sales submission comments
    """

    def update(self, instance, validated_data):
        instance.comment = validated_data.get("comment")
        instance.save()
        return instance

    class Meta:
        model = SalesSubmissionComment
        fields = (
            'id', 'comment', 'create_timestamp', 'create_user','to_govt', 'update_timestamp'
        )
        read_only_fields = (
            'id',
        )

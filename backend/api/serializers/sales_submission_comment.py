"""
Sales Submission Comment Serializer
"""
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.user_profile import UserProfile
from api.models.sales_submission_comment import SalesSubmissionComment
from api.serializers.user import MemberSerializer
from ..mixins.user_mixin import get_user_data


class SalesSubmissionCommentSerializer(ModelSerializer):
    """
    Serializer for sales submission comments
    """
    create_user = SerializerMethodField()

    def get_create_user(self, obj):
        return get_user_data(obj, 'create_user', self.context.get('request'))

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

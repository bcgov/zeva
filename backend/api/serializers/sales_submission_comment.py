"""
Sales Submission Comment Serializer
"""
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.user_profile import UserProfile
from api.models.sales_submission_comment import SalesSubmissionComment
from api.serializers.user import MemberSerializer


class SalesSubmissionCommentSerializer(ModelSerializer):
    """
    Serializer for sales submission comments
    """
    create_user = SerializerMethodField()

    def get_create_user(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user is None:
            return obj.create_user

        serializer = MemberSerializer(user, read_only=True)
        return serializer.data

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

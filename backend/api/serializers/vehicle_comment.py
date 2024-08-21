"""
Vehicle Comment Serializer
"""
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.user_profile import UserProfile
from api.models.vehicle_comment import VehicleComment
from api.serializers.user import MemberSerializer


class VehicleCommentSerializer(ModelSerializer):
    """
    Serializer for comments
    """
    create_user = SerializerMethodField()

    def get_create_user(self, obj):
        request = self.context.get('request')
        commenting_user = UserProfile.objects.filter(username=obj.create_user).first()
        if commenting_user is None:
            return obj.create_user
        if not commenting_user.is_government or request.user.is_government:
            ## if the commentor is not government or the request
            #  user is government, show all the data
            serializer = MemberSerializer(commenting_user, read_only=True)
            return serializer.data
        else:
            #if the request user is not government and the commenter
            #is government
            return {'display_name': 'Government User'}

    class Meta:
        model = VehicleComment
        fields = (
            'id', 'comment', 'create_timestamp', 'create_user',
        )
        read_only_fields = (
            'id',
        )

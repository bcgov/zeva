from rest_framework import serializers
from ..models.user_profile import UserProfile
from ..serializers.user import MemberSerializer

class CreateUserMixin:
    def get_create_user_data(self, obj):
        request = self.context.get('request')
        commenting_user = UserProfile.objects.filter(username=obj.create_user).first()
        if commenting_user is None:
            return obj.create_user
        if not commenting_user.is_government or request.user.is_government:
            ## if the commenter is not government or the request
            ## user is government, show all the data
            serializer = MemberSerializer(commenting_user, read_only=True)
            return serializer.data
        else:
            ## if the request user is not government and the commenter
            ## is government
            return {'display_name': 'Government User'}
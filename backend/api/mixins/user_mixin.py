from rest_framework import serializers
from ..models.user_profile import UserProfile
from ..serializers.user import MemberSerializer

class UserMixin:
    def get_user_data(self, obj, user_attr, context=None):
        if context is None:
            # Called as instance method
            context = self.context
        request = context.get('request')
        if request is None:
            return getattr(obj, user_attr, None)
        
        update_or_create_user_username = getattr(obj, user_attr, None)

        if update_or_create_user_username is None:
            return f"{user_attr} does not exist on the object."
        update_or_create_user = UserProfile.objects.filter(username=update_or_create_user_username).first()
        if update_or_create_user is None:
            return update_or_create_user_username
        if not update_or_create_user.is_government or request.user.is_government:
            ## if the commenter is not government or the request
            ## user is government, show all the data
            serializer = MemberSerializer(update_or_create_user, read_only=True)
            return serializer.data
        else:
            ## if the request user is not government and the commenter
            ## is government
            return {'display_name': 'Government User'}
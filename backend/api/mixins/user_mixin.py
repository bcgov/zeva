from rest_framework import serializers
from ..models.user_profile import UserProfile
from ..serializers.user import UserBasicSerializer
from ..serializers.organization import OrganizationNameSerializer

def get_user_data(obj, user_attr, request):
    user_attr_value = getattr(obj, user_attr, None)

    if user_attr_value is None:
        return f"{user_attr} does not exist on the object."
    user_profile = UserProfile.objects.filter(username=user_attr_value).first()
    if not user_profile:
        return {'display_name': user_attr_value}  # Return the username if the user profile doesn't exist

    if not user_profile.is_government or request.user.is_government:
        # If the user is non-government or the requesting user is government, return full data
        serializer = UserBasicSerializer(user_profile, read_only=True)
        return serializer.data
    else:
        # If the requesting user is non-government and the user is government, limit info
        organization = OrganizationNameSerializer(user_profile.organization, read_only=True)
        return {
            'display_name': 'Government User',
            'is_government': user_profile.is_government,
            'organization': organization.data
        }

class UserMixin:
    def get_create_user(self, obj):
        # Call get_user_data with the appropriate user attribute 'create_user'
        return get_user_data(obj, 'create_user', self.context.get('request'))

    def get_update_user(self, obj):
        # Call get_user_data with the appropriate user attribute 'update_user'
        return get_user_data(obj, 'update_user', self.context.get('request'))
from api.models.user_profile import UserProfile
from api.serializers.user import UserBasicSerializer
from api.serializers.organization import OrganizationNameSerializer


def get_user_data(username, request):
    if username is None:
        return f"{username} does not exist on the object."
    user_profile = UserProfile.objects.filter(username=username).first()
    if not user_profile:
        return {
            "display_name": username
        }  # Return the username if the user profile doesn't exist

    is_government = False
    if request is not None:
        is_government = request.user.is_government

    if not user_profile.is_government or is_government:
        # If the user is non-government or the requesting user is government, return full data
        serializer = UserBasicSerializer(user_profile, read_only=True)
        return serializer.data
    else:
        # If the requesting user is non-government and the user is government, limit info
        organization = OrganizationNameSerializer(
            user_profile.organization, read_only=True
        )
        return {
            "display_name": "Government User",
            "is_government": user_profile.is_government,
            "organization": organization.data,
        }


class UserMixin:
    def get_create_user(self, obj):
        username = getattr(obj, "create_user", None)
        request = self.context.get("request")
        return get_user_data(username, request)

    def get_update_user(self, obj):
        username = getattr(obj, "update_user", None)
        request = self.context.get("request")
        return get_user_data(username, request)

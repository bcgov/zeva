from rest_framework import serializers

from api.models.user_profile import UserProfile
from .organization import OrganizationSerializer


class MemberSerializer(serializers.ModelSerializer):
    """
    Serializer for getting the details of the user WITHOUT getting the
    organization of the user so it doesn't do an infinite loop.
    """
    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email',
            'username', 'display_name', 'is_active', 'phone'
        )


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the full details of the User and what permissions
    the user has
    """
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email',
            'username', 'display_name', 'is_active',
            'organization', 'phone')

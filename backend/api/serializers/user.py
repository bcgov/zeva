from rest_framework import serializers
from rest_framework.fields import SerializerMethodField

from api.models.user_profile import UserProfile
from .organization import OrganizationSerializer
from ..services.keycloak_api import get_token, list_groups_for_username


class MemberSerializer(serializers.ModelSerializer):
    """
    Serializer for getting the details of the user WITHOUT getting the
    organization of the user so it doesn't do an infinite loop.
    """
    groups = SerializerMethodField()

    def get_groups(self, object):
        return list_groups_for_username(get_token(), object.username)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email',
            'username', 'display_name', 'is_active', 'phone',
            'groups'
        )


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the full details of the User
    """
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email',
            'username', 'display_name', 'is_active',
            'organization', 'phone', 'is_government')

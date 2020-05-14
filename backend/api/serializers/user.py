from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from rest_framework.relations import PrimaryKeyRelatedField

from api.models.organization import Organization
from api.models.role import Role
from api.models.user_profile import UserProfile
from api.models.user_role import UserRole
from .organization import OrganizationSerializer
from .role import RoleSerializer
from ..services.keycloak_api import get_token, \
    list_groups_for_username, update_user_groups


class MemberSerializer(serializers.ModelSerializer):
    """
    Serializer for getting the details of the user WITHOUT getting the
    organization of the user so it doesn't do an infinite loop.
    """
    groups = SerializerMethodField()
    roles = RoleSerializer(read_only=True, many=True)

    def get_groups(self, object):
        return list_groups_for_username(get_token(), object.username)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email',
            'username', 'display_name', 'is_active', 'phone',
            'groups', 'roles'
        )


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the full details of the User
    """
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email', 'username',
            'display_name', 'is_active', 'organization', 'phone',
            'is_government', 'keycloak_email', 'title'
        )


class UserSaveSerializer(serializers.ModelSerializer):
    """
    Serializer to create/edit a user
    """
    organization = OrganizationSerializer(read_only=True)
    roles = PrimaryKeyRelatedField(queryset=Role.objects.all(), many=True)

    def create(self, validated_data):
        request = self.context.get('request')
        organization = request.data.get('organization')
        roles = validated_data.pop('roles')

        user_profile = UserProfile.objects.create(**validated_data)
        user_profile.organization_id = organization.get('id')
        user_profile.display_name = '{first_name} {last_name}'.format(
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name')
        )
        user_profile.save()

        for role in roles:
            if not role.is_government_role:
                UserRole.objects.create(
                    user_profile=user_profile,
                    role=role,
                    create_user=request.user
                )

        return user_profile

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email', 'username', 'title',
            'organization', 'organization_id', 'display_name', 'is_active',
            'phone', 'keycloak_email', 'roles'
        )

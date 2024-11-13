from django.core.exceptions import PermissionDenied
from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField

from api.models.role import Role
from api.models.user_profile import UserProfile
from api.services.user import update_roles, create_default_user_notification_settings
from .organization import OrganizationSerializer, OrganizationNameSerializer
from .permission import PermissionSerializer
from .role import RoleSerializer


class MemberSerializer(serializers.ModelSerializer):
    """
    Serializer for getting the details of the user WITHOUT getting the
    organization of the user so it doesn't do an infinite loop.
    """
    roles = RoleSerializer(read_only=True, many=True)
    is_mapped = serializers.SerializerMethodField()

    def get_is_mapped(self, obj):
        return obj.keycloak_user_id is not None

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email',
            'display_name', 'is_active', 'phone',
            'roles', 'is_mapped'
        )


class UserBasicSerializer(serializers.ModelSerializer):
    """
    Serializer for the basic details of a user
    """
    organization = OrganizationNameSerializer(read_only=True)
    class Meta:
        model = UserProfile
        fields = (
            'id', 'display_name', 'organization', 'is_government'
        )

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the full details of the User
    """
    organization = OrganizationSerializer(read_only=True)
    permissions = PermissionSerializer(read_only=True, many=True)
    roles = RoleSerializer(read_only=True, many=True)
    is_mapped = serializers.SerializerMethodField()

    def get_is_mapped(self, obj):
        return obj.keycloak_user_id is not None

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email', 'username',
            'display_name', 'is_active', 'organization', 'phone',
            'is_government', 'keycloak_email', 'roles', 'title',
            'permissions', 'is_mapped'
        )


class UserSaveSerializer(serializers.ModelSerializer):
    """
    Serializer to create/edit a user
    """
    organization = OrganizationSerializer(read_only=True)
    roles = PrimaryKeyRelatedField(queryset=Role.objects.all(), many=True)

    def validate_roles(self, roles):
        request = self.context.get('request')

        for role in roles:
            if (
                (not role.is_government_role and
                    not request.user.has_perm('ASSIGN_BCEID_ROLES')) or
                (role.is_government_role and
                    not request.user.has_perm('ASSIGN_IDIR_ROLES'))
            ):
                raise PermissionDenied(
                    "You do not have the permission to add {}.".format(
                        role.description
                    )
                )

        return roles

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

        update_roles(request, user_profile, roles)
        create_default_user_notification_settings(user_profile)

        return user_profile

    def update(self, instance, validated_data):
        request = self.context.get('request')
        roles = validated_data.pop('roles')

        for data in validated_data:
            setattr(instance, data, validated_data[data])
        instance.display_name = '{first_name} {last_name}'.format(
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name')
        )
        instance.save()

        update_roles(request, instance, roles)

        return instance

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name', 'email', 'username', 'title',
            'organization', 'organization_id', 'display_name', 'is_active',
            'phone', 'keycloak_email', 'roles', 'create_user', 'update_user',
        )
        extra_kwargs = {
            'first_name': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
            'keycloak_email': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
            'last_name': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
            'title': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
        }

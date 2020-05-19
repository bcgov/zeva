from rest_framework.serializers import ModelSerializer

from api.models.role import Role


class RoleSerializer(ModelSerializer):
    class Meta:
        model = Role
        fields = (
            'id', 'role_code', 'description', 'is_government_role',
        )

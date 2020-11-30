from rest_framework.serializers import ModelSerializer
from .permission import PermissionSerializer

from api.models.role import Role


class RoleSerializer(ModelSerializer):
    permissions = PermissionSerializer(read_only=True, many=True)
    
    class Meta:
        model = Role
        fields = (
            'id', 'role_code', 'description', 'permissions', 'is_government_role',
        )

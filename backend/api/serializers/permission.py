from rest_framework.serializers import ModelSerializer

from api.models.permission import Permission


class PermissionSerializer(ModelSerializer):
    class Meta:
        model = Permission
        fields = (
            'id', 'permission_code', 'name', 'description',
        )

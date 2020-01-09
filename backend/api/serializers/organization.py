from rest_framework import serializers

from api.models.organization import Organization
from api.serializers.organization_address import OrganizationAddressSerializer


class OrganizationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Supplier
    Loads most of the fields and the balance for the Supplier
    """
    organization_address = serializers.SerializerMethodField()

    def get_organization_address(self, obj):
        """
        Loads the latest valid address for the organization
        """
        if obj.organization_address is None:
            return None

        serializer = OrganizationAddressSerializer(
            obj.organization_address, read_only=True
        )

        return serializer.data

    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'organization_address', 'create_timestamp'
        )


class OrganizationWithMembersSerializer(OrganizationSerializer):
    """
    Same as above, but will load the members
    """
    users = serializers.SerializerMethodField()

    def get_users(self, obj):
        from api.serializers.user import MemberSerializer

        serializer = MemberSerializer(obj.members, read_only=True, many=True)

        return serializer.data

    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'organization_address', 'users', 'create_timestamp'
        )

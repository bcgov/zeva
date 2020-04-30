from rest_framework import serializers

from api.models.organization import Organization
from api.serializers.organization_address import OrganizationAddressSerializer
from api.models.organization_address import OrganizationAddress
from datetime import date

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
            'id', 'name', 'organization_address', 'create_timestamp',
            'balance', 'is_active', 'short_name'
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
            'id', 'name', 'organization_address', 'users', 'create_timestamp',
            'balance'
        )


class OrganizationSaveSerializer(serializers.ModelSerializer):
    """
    Serializer for saving/editing the Supplier
    Loads most of the fields and the balance for the Supplier
    """
    organization_address = OrganizationAddressSerializer(allow_null=True)

    def update(self, obj, validated_data):
        addr = validated_data.pop('organization_address')
        short_name = validated_data.pop('short_name')
        is_active = validated_data.pop('is_active')
        obj.short_name = short_name
        obj.is_active = is_active
        obj.save()
        organization_address = obj.organization_address
        if organization_address:
            organization_address.expiration_date = date.today()
            organization_address.save()

        OrganizationAddress.objects.create(
            effective_date=date.today(),
            organization=obj,
            **addr
        )
        return obj

    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'organization_address', 'create_timestamp',
            'balance', 'is_active', 'short_name'
        )
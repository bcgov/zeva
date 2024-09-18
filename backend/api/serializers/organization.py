from datetime import date
from rest_framework import serializers

from api.models.organization import Organization
from api.models.organization_address import OrganizationAddress
from api.serializers.organization_address import \
    OrganizationAddressSerializer, OrganizationAddressSaveSerializer
from api.serializers.organization_ldv_sales import \
    OrganizationLDVSalesSerializer
from api.models.model_year import ModelYear

class OrganizationNameSerializer(serializers.ModelSerializer):
    """
    Serializer for passing just the necessary info for credit transfers etc
    """
    class Meta:
        model = Organization
        fields = (
            'name', 'short_name', 'is_government'
        )


class OrganizationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Supplier
    Loads most of the fields and the balance for the Supplier
    """
    organization_address = serializers.SerializerMethodField()
    avg_ldv_sales = serializers.SerializerMethodField()
    ldv_sales = OrganizationLDVSalesSerializer(many=True)
    first_model_year = serializers.SerializerMethodField()

    def get_organization_address(self, obj):
        """
        Loads the latest valid address for the organization
        """
        if obj.organization_address is None:
            return None

        serializer = OrganizationAddressSerializer(
            obj.organization_address, read_only=True, many=True
        )

        return serializer.data

    def get_avg_ldv_sales(self, obj):
        return obj.get_avg_ldv_sales()
    
    def get_first_model_year(self, obj):
        if obj.first_model_year is not None:
            return obj.first_model_year.name
        return None

    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'create_timestamp', 'organization_address',
            'balance', 'is_active', 'short_name', 'is_government',
            'supplier_class', 'avg_ldv_sales', 'ldv_sales',
            'has_submitted_report', 'first_model_year', 'has_report',
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
    organization_address = OrganizationAddressSaveSerializer(allow_null=True, many=True)
    first_model_year = serializers.SlugRelatedField(slug_field="name", queryset=ModelYear.objects.all())

    def create(self, validated_data):
        request = self.context.get('request')
        addr = validated_data.pop('organization_address')
        obj = Organization.objects.create(
            **validated_data
        )
        if addr:
            for i in addr:
                OrganizationAddress.objects.create(
                    create_user=request.user.username,
                    effective_date=date.today(),
                    organization=obj,
                    **i
                )
        return obj

    def update(self, obj, validated_data):
        request = self.context.get('request')

        addr = validated_data.get('organization_address')
        short_name = validated_data.get('short_name')
        is_active = validated_data.get('is_active')
        name = validated_data.get('name')
        first_model_year = validated_data.get('first_model_year')

        # disable all supplier users when we
        # deactivate the organization
        if obj.is_active and not is_active:
            members = obj.members
            for member in members:
                member.is_active = False
                member.save()

        obj.short_name = short_name
        obj.is_active = is_active
        obj.name = name
        obj.update_user = request.user.username
        obj.first_model_year = first_model_year
        obj.save()

        if addr:
            for i in addr:
                found = OrganizationAddress.objects.filter(
                    **i,
                    organization=obj,
                    expiration_date=None)

                # skip adding an address, if we already have the exact same
                # address stored in the database
                if not found:
                    # expire all previous addresses for the address type
                    OrganizationAddress.objects.filter(
                        address_type=i.get('address_type'),
                        organization=obj
                    ).update(
                        expiration_date=date.today(),
                        update_user=request.user.username
                    )

                    OrganizationAddress.objects.create(
                        create_user=request.user.username,
                        effective_date=date.today(),
                        organization=obj,
                        **i
                    )
        return validated_data

    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'organization_address', 'create_timestamp',
            'balance', 'is_active', 'short_name', 'create_user', 'update_user',
            'is_government', 'supplier_class', 'ldv_sales',
            'has_submitted_report', 'first_model_year',
        )
        extra_kwargs = {
            'name': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
            'short_name': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
        }

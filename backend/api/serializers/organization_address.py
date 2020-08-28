from rest_framework.serializers import SlugRelatedField, ModelSerializer
from api.models.organization_address import OrganizationAddress
from api.models.address_type import AddressType


class AddressTypeSerializer(ModelSerializer):
    class Meta:
        model = AddressType
        fields = (
            'address_type',
        )


class OrganizationAddressSerializer(ModelSerializer):
    """
    Address Serializer that loads all the fields that useful for
    displaying.
    """
    # address_type = AddressTypeSerializer(read_only=True)

    class Meta:
        model = OrganizationAddress
        fields = (
            'id', 'address_line_1', 'address_line_2', 'address_line_3',
            'city', 'postal_code', 'state', 'county', 'country', 'address_type'
        )
        # extra_kwargs = {
            # 'address_line_1': {
            #     'allow_null': False, 'allow_blank': False, 'required': True
            # },
            # 'city': {
            #     'allow_null': False, 'allow_blank': False, 'required': True
            # },
            # 'postal_code': {
            #     'allow_null': False, 'allow_blank': False, 'required': True
            # },
            # 'state': {
            #     'allow_null': False, 'allow_blank': False, 'required': True
            # },
            # 'country': {
            #     'allow_null': False, 'allow_blank': False, 'required': True
            # },
        # }


class OrganizationAddressSaveSerializer(ModelSerializer):
    """
    Address Serializer that loads all the fields that useful for
    displaying.
    """
    address_type = SlugRelatedField(slug_field='address_type', queryset=AddressType.objects.all())

    class Meta:
        model = OrganizationAddress
        fields = (
            'id', 'address_line_1', 'address_line_2', 'address_line_3',
            'city', 'postal_code', 'state', 'county', 'country', 'address_type'
        )

from rest_framework import serializers

from api.models.organization_address import OrganizationAddress


class OrganizationAddressSerializer(serializers.ModelSerializer):
    """
    Address Serializer that loads all the fields that useful for
    displaying.
    """
    class Meta:
        model = OrganizationAddress
        fields = (
            'id', 'address_line_1', 'address_line_2', 'address_line_3',
            'city', 'postal_code', 'state', 'county', 'country'
        )
        extra_kwargs = {
            'address_line_1': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
            'city': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
            'postal_code': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
            'state': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
            'country': {
                'allow_null': False, 'allow_blank': False, 'required': True
            },
        }

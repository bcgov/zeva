from enumfields.drf import EnumSupportSerializerMixin, EnumField
from rest_framework import serializers

from ..models.credit_value import CreditValue
from ..models.vehicle import Vehicle, ModelYear, VehicleDefinitionStates


class CreditValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditValue
        fields = (
            'a', 'b'
        )


class ModelYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelYear
        fields = (
            'name', 'effective_date', 'expiration_date'
        )


class VehicleSerializer(serializers.ModelSerializer, EnumSupportSerializerMixin):

    credit_value = CreditValueSerializer()
    type = serializers.SlugRelatedField(slug_field='name', read_only=True)
    make = serializers.SlugRelatedField(slug_field='name', read_only=True)
    model = serializers.SlugRelatedField(slug_field='name', read_only=True)
    trim = serializers.SlugRelatedField(slug_field='name', read_only=True)
    model_year = ModelYearSerializer()
    state = EnumField(VehicleDefinitionStates, read_only=True)

    class Meta:
        model = Vehicle
        fields = (
            'id', 'type', 'make', 'model', 'trim', 'state',
            'range', 'credit_value', 'model_year'
        )
        read_only_fields = ('state',)


from rest_framework import serializers

from ..models.credit_value import CreditValue
from ..models.vehicle import Vehicle, ModelYear, Make, Model, Type, Trim


class CreditValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditValue
        fields = (
            'a', 'b'
        )


class MakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Make
        fields = (
             'name', 'id'
        )


class ModelYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelYear
        fields = (
            'name', 'effective_date', 'expiration_date', 'id'
        )


class TrimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trim
        fields = (
             'name', 'id'
        )


class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = (
             'name', 'id'
        )


class VehicleModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = (
             'name', 'id'
        )


class VehicleSerializer(serializers.ModelSerializer):

    credit_value = CreditValueSerializer()
    type = serializers.SlugRelatedField(slug_field='name', read_only=True)
    make = serializers.SlugRelatedField(slug_field='name', read_only=True)
    model = serializers.SlugRelatedField(slug_field='name', read_only=True)
    trim = serializers.SlugRelatedField(slug_field='name', read_only=True)
    model_year = ModelYearSerializer()

    class Meta:
        model = Vehicle
        fields = (
            'id', 'type', 'make', 'model', 'trim', 'validated',
            'range', 'credit_value', 'model_year'
        )

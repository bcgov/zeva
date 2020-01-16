from rest_framework import serializers

from api.models.credit_value import CreditValue
from api.models.vehicle import Vehicle
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model
from api.models.vehicle_model_year import ModelYear
from api.models.vehicle_trim import Trim
from api.models.vehicle_type import Type


class CreditValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditValue
        fields = (
            'a', 'b',
        )


class VehicleMakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Make
        fields = (
            'name',
        )


class VehicleModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = (
            'name',
        )


class VehicleTrimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trim
        fields = (
            'name',
        )


class VehicleModelYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelYear
        fields = (
            'name', 'effective_date', 'expiration_date',
        )


class VehicleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = (
            'name',
        )


class VehicleSerializer(serializers.ModelSerializer):
    credit_value = CreditValueSerializer()
    type = VehicleTypeSerializer()
    make = VehicleMakeSerializer()
    model = VehicleModelSerializer()
    trim = VehicleTrimSerializer()
    model_year = VehicleModelYearSerializer()

    class Meta:
        model = Vehicle
        fields = (
            'id', 'type', 'make', 'model', 'trim', 'validated',
            'range', 'credit_value', 'model_year',
        )


class VehicleSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = (
            'id', 'type', 'make', 'model', 'trim', 'validated',
            'range', 'credit_value', 'model_year',
        )

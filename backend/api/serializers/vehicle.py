from rest_framework import serializers

from api.models.credit_value import CreditValue
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model
from api.models.vehicle_trim import Trim
from api.models.vehicle_type import Type


class CreditValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditValue
        fields = (
            'class_a_credit_value', 'class_b_credit_value',
        )


class VehicleMakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Make
        fields = (
            'name', 'id'
        )


class VehicleModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = (
            'name', 'id'
        )


class VehicleTrimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trim
        fields = (
            'name', 'id'
        )


class VehicleModelYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelYear
        fields = (
            'name', 'effective_date', 'expiration_date', 'id'
        )


class VehicleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = (
            'name',
        )


class VehicleSerializer(serializers.ModelSerializer):
    credit_value = CreditValueSerializer()
    make = VehicleMakeSerializer()
    model = VehicleModelSerializer()
    model_year = VehicleModelYearSerializer()
    trim = VehicleTrimSerializer()
    type = VehicleTypeSerializer()

    class Meta:
        model = Vehicle
        fields = (
            'id', 'type', 'make', 'model', 'trim', 'is_validated',
            'range', 'credit_value', 'model_year',
        )


class VehicleSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = (
            'id', 'type', 'make', 'model', 'trim', 'is_validated',
            'range', 'credit_value', 'model_year',
        )

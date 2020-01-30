from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.relations import SlugRelatedField

from api.models.credit_value import CreditValue
from api.models.model_year import ModelYear
<<<<<<< HEAD
from api.models.vehicle import Vehicle, VehicleDefinitionStates, \
    VehicleChangeHistory
=======
from api.models.vehicle import Vehicle, VehicleDefinitionStates, VehicleChangeHistory
>>>>>>> master
from api.models.vehicle_class import VehicleClass
from api.models.vehicle_fuel_type import FuelType
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model
from api.models.vehicle_trim import Trim
from api.services.vehicle import change_state


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
            'name',
        )


class VehicleModelSerializer(serializers.ModelSerializer):
<<<<<<< HEAD
    make = VehicleMakeSerializer()
=======
    make = serializers.SlugRelatedField(slug_field='name', read_only=True)
>>>>>>> master

    class Meta:
        model = Model
        fields = (
            'name', 'id', 'make'
        )


class VehicleTrimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trim
        fields = (
            'name', 'id'
        )


class ModelYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelYear
        fields = (
            'name', 'id', 'effective_date', 'expiration_date'
        )


class VehicleFuelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelType
        fields = (
<<<<<<< HEAD
            'vehicle_fuel_code', 'id', 'description'
=======
            'vehicle_fuel_code', 'description'
>>>>>>> master
        )


class VehicleClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleClass
        fields = (
<<<<<<< HEAD
            'vehicle_class_code', 'id', 'description'
=======
            'vehicle_class_code', 'description'
>>>>>>> master
        )


class VehicleStateChangeSerializer(serializers.ModelSerializer):
    state = EnumField(VehicleDefinitionStates)

    def update(self, instance, validated_data):
        change_state(self.context['request'].user, instance, validated_data.get('state'))
        return instance

    class Meta:
        model = Vehicle
        fields = ('state',)


class VehicleHistorySerializer(
        serializers.ModelSerializer, EnumSupportSerializerMixin
):
    actor = serializers.SlugRelatedField(slug_field='username', read_only=True)
    current_state = EnumField(VehicleDefinitionStates, read_only=True)
    previous_state = EnumField(VehicleDefinitionStates, read_only=True)

    class Meta:
        model = VehicleChangeHistory
        fields = (
            'actor', 'current_state', 'previous_state', 'at'
        )


class VehicleSerializer(
        serializers.ModelSerializer, EnumSupportSerializerMixin
):
    make = VehicleMakeSerializer()
    model = VehicleModelSerializer()
    model_year = ModelYearSerializer()
    state = EnumField(VehicleDefinitionStates, read_only=True)
    vehicle_fuel_type = VehicleFuelTypeSerializer()
    changelog = VehicleHistorySerializer(read_only=True, many=True)
    actions = serializers.SerializerMethodField()

    def get_actions(self, instance):
        user = self.context['request'].user
        gov = self.context['request'].user.is_government

        actions = []

        if (gov and instance.state is VehicleDefinitionStates.SUBMITTED):
            actions.append('VALIDATED')
            actions.append('REJECTED')

        if (not gov and instance.state in [
                VehicleDefinitionStates.DRAFT, VehicleDefinitionStates.NEW
        ]):
            actions.append('SUBMITTED')

        return actions

    class Meta:
        model = Vehicle
        fields = (
            'id', 'make', 'model', 'state', 'vehicle_fuel_type',
            'range', 'model_year', 'changelog',
            'actions'
        )
        read_only_fields = ('state',)


class VehicleSaveSerializer(
        serializers.ModelSerializer, EnumSupportSerializerMixin
):
    model_year = serializers.PrimaryKeyRelatedField(
        queryset=ModelYear.objects.all()
    )
    make = serializers.PrimaryKeyRelatedField(
        queryset=Make.objects.all()
    )
    vehicle_class_code = serializers.PrimaryKeyRelatedField(
        queryset=VehicleClass.objects.all()
    )
    vehicle_fuel_type = serializers.PrimaryKeyRelatedField(
        queryset=FuelType.objects.all()
    )
    state = EnumField(VehicleDefinitionStates, read_only=True)

    class Meta:
        model = Vehicle
        fields = (
            'id', 'vehicle_fuel_type', 'make', 'model', 'vehicle_class_code',
            'range', 'model_year',
            'state'
        )
        read_only_fields = ('state', 'id',)

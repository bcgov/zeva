from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField

from api.models.credit_value import CreditValue
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle, VehicleDefinitionStates, \
    VehicleChangeHistory
from api.models.vehicle_class import VehicleClass
from api.models.vehicle_fuel_type import FuelType
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model
from api.models.vehicle_trim import Trim
from api.services.vehicle import change_state


class CreditValueSerializer(ModelSerializer):
    class Meta:
        model = CreditValue
        fields = (
            'class_a_credit_value', 'class_b_credit_value',
        )


class VehicleMakeSerializer(ModelSerializer):
    class Meta:
        model = Make
        fields = (
            'name',
        )


class VehicleModelSerializer(ModelSerializer):
    make = VehicleMakeSerializer()

    class Meta:
        model = Model
        fields = (
            'name', 'id', 'make'
        )


class VehicleTrimSerializer(ModelSerializer):
    class Meta:
        model = Trim
        fields = (
            'name', 'id'
        )


class ModelYearSerializer(ModelSerializer):
    class Meta:
        model = ModelYear
        fields = (
            'name', 'effective_date', 'expiration_date'
        )


class VehicleFuelTypeSerializer(ModelSerializer):
    class Meta:
        model = FuelType
        fields = (
            'vehicle_fuel_code', 'description'
        )


class VehicleClassSerializer(ModelSerializer):
    class Meta:
        model = VehicleClass
        fields = (
            'vehicle_class_code', 'description'
        )


class VehicleStateChangeSerializer(ModelSerializer):
    state = EnumField(VehicleDefinitionStates)

    def update(self, instance, validated_data):
        change_state(
            self.context['request'].user, instance,
            validated_data.get('state')
        )
        return instance

    class Meta:
        model = Vehicle
        fields = ('state',)


class VehicleHistorySerializer(
        ModelSerializer, EnumSupportSerializerMixin
):
    actor = SlugRelatedField(slug_field='username', read_only=True)
    current_state = EnumField(VehicleDefinitionStates, read_only=True)
    previous_state = EnumField(VehicleDefinitionStates, read_only=True)

    class Meta:
        model = VehicleChangeHistory
        fields = (
            'actor', 'current_state', 'previous_state', 'at'
        )


class VehicleSerializer(
        ModelSerializer, EnumSupportSerializerMixin
):
    make = VehicleMakeSerializer()
    model = VehicleModelSerializer()
    model_year = ModelYearSerializer()
    state = EnumField(VehicleDefinitionStates, read_only=True)
    vehicle_fuel_type = VehicleFuelTypeSerializer()
    changelog = VehicleHistorySerializer(read_only=True, many=True)
    actions = SerializerMethodField()

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
        ModelSerializer, EnumSupportSerializerMixin
):
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    make = SlugRelatedField(
        slug_field='name',
        queryset=Make.objects.all()
    )
    vehicle_class_code = SlugRelatedField(
        slug_field='vehicle_class_code',
        queryset=VehicleClass.objects.all()
    )
    vehicle_fuel_type = SlugRelatedField(
        slug_field='vehicle_fuel_code',
        queryset=FuelType.objects.all()
    )
    state = EnumField(
        VehicleDefinitionStates,
        read_only=True
    )

    class Meta:
        model = Vehicle
        fields = (
            'id', 'vehicle_fuel_type', 'make', 'model', 'vehicle_class_code',
            'range', 'model_year', 'state'
        )
        read_only_fields = ('state', 'id',)

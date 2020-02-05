from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField

from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.models.vehicle_change_history import VehicleChangeHistory
from api.models.vehicle_class import VehicleClass
from api.models.vehicle_fuel_type import FuelType
from api.models.vehicle_make import Make
from api.services.vehicle import change_status


class VehicleMakeSerializer(ModelSerializer):
    class Meta:
        model = Make
        fields = (
            'name',
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


class VehicleStatusChangeSerializer(ModelSerializer):
    validation_status = EnumField(VehicleDefinitionStatuses)

    def update(self, instance, validated_data):
        change_status(
            self.context['request'].user,
            instance,
            validated_data.get('validation_status')
        )
        return instance

    class Meta:
        model = Vehicle
        fields = ('validation_status',)


class VehicleHistorySerializer(
        ModelSerializer, EnumSupportSerializerMixin
):
    validation_status = EnumField(VehicleDefinitionStatuses, read_only=True)

    class Meta:
        model = VehicleChangeHistory
        fields = (
            'validation_status'
        )


class VehicleSerializer(
        ModelSerializer, EnumSupportSerializerMixin
):
    make = VehicleMakeSerializer()
    model_year = ModelYearSerializer()
    validation_status = EnumField(VehicleDefinitionStatuses, read_only=True)
    vehicle_fuel_type = VehicleFuelTypeSerializer()
    history = VehicleHistorySerializer(read_only=True, many=True)
    actions = SerializerMethodField()

    def get_actions(self, instance):
        user = self.context['request'].user
        gov = self.context['request'].user.is_government

        actions = []

        if (gov and instance.validation_status is
                VehicleDefinitionStatuses.SUBMITTED):
            actions.append('VALIDATED')
            actions.append('REJECTED')

        if (not gov and instance.validation_status in [
                VehicleDefinitionStatuses.DRAFT, VehicleDefinitionStatuses.NEW
        ]):
            actions.append('SUBMITTED')

        return actions

    class Meta:
        model = Vehicle
        fields = (
            'id', 'actions', 'history', 'make', 'model_name', 'model_year',
            'range', 'validation_status', 'vehicle_fuel_type'
        )
        read_only_fields = ('validation_status',)


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
    validation_status = EnumField(
        VehicleDefinitionStatuses,
        read_only=True
    )

    class Meta:
        model = Vehicle
        fields = (
            'id', 'make', 'model_name', 'model_year', 'range',
            'validation_status', 'vehicle_class_code', 'vehicle_fuel_type'
        )
        read_only_fields = ('validation_status', 'id',)

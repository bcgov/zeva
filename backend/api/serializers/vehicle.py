from django.core.exceptions import PermissionDenied
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField

from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass
from api.models.vehicle import Vehicle
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.models.vehicle_change_history import VehicleChangeHistory
from api.models.vehicle_zev_type import ZevType
from api.serializers.user import UserSerializer
from api.services.vehicle import change_status


class ModelYearSerializer(ModelSerializer):
    class Meta:
        model = ModelYear
        fields = (
            'name', 'effective_date', 'expiration_date'
        )


class VehicleZevTypeSerializer(ModelSerializer):
    class Meta:
        model = ZevType
        fields = (
            'vehicle_zev_code', 'description'
        )
        

class VehicleStatusChangeSerializer(ModelSerializer):
    validation_status = EnumField(VehicleDefinitionStatuses)

    def validate_validation_status(self, value):
        request = self.context.get('request')

        if value == VehicleDefinitionStatuses.SUBMITTED and \
                not request.user.has_role('Submit ZEV'):
            raise PermissionDenied(
                "You do not have the permission to submit this vehicle."
            )

        if value == VehicleDefinitionStatuses.VALIDATED and \
                not request.user.has_role('Validate ZEV'):
            raise PermissionDenied(
                "You do not have the permission to validate this vehicle."
            )

        return value

    def update(self, instance, validated_data):
        status = validated_data.get('validation_status')
        change_status(
            self.context['request'].user,
            instance,
            status
        )

        if status == VehicleDefinitionStatuses.VALIDATED:
            instance.credit_class = CreditClass.objects.get(
                credit_class=instance.get_credit_class()
            )
            instance.credit_value = instance.get_credit_value()
            instance.save()

        return instance

    class Meta:
        model = Vehicle
        fields = (
            'validation_status',
        )


class VehicleHistorySerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    create_user = UserSerializer(read_only=True)
    validation_status = EnumField(VehicleDefinitionStatuses, read_only=True)

    class Meta:
        model = VehicleChangeHistory
        fields = ('create_timestamp', 'create_user', 'validation_status')


class VehicleSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    model_year = ModelYearSerializer()
    validation_status = EnumField(VehicleDefinitionStatuses, read_only=True)
    vehicle_zev_type = VehicleZevTypeSerializer()
    history = VehicleHistorySerializer(read_only=True, many=True)
    actions = SerializerMethodField()
    credit_class = SerializerMethodField()
    credit_value = SerializerMethodField()

    def get_actions(self, instance):
        request = self.context.get('request')
        gov = request.user.is_government

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

    def get_credit_class(self, instance):
        request = self.context.get('request')

        if instance.validation_status == \
                VehicleDefinitionStatuses.VALIDATED or \
                request.user.is_government:
            return instance.get_credit_class()

        return None

    def get_credit_value(self, instance):
        request = self.context.get('request')

        if instance.validation_status == \
                VehicleDefinitionStatuses.VALIDATED or \
                request.user.is_government:
            return instance.get_credit_value()

        return None

    class Meta:
        model = Vehicle
        fields = (
            'id', 'actions', 'history', 'make', 'model_name', 'model_year',
            'range', 'validation_status', 
            'vehicle_zev_type', 'credit_class', 'credit_value'
        )
        read_only_fields = ('validation_status',)


class VehicleSaveSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )

    vehicle_zev_type = SlugRelatedField(
        slug_field='vehicle_zev_code',
        queryset=ZevType.objects.all()
    )
    validation_status = EnumField(
        VehicleDefinitionStatuses,
        read_only=True
    )

    class Meta:
        model = Vehicle
        fields = (
            'id', 'make', 'model_name', 'model_year', 'range',
            'validation_status', 'vehicle_zev_type'
        )
        read_only_fields = ('validation_status', 'id',)


class VehicleMinSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    vehicle_zev_type = SlugRelatedField(
        slug_field='vehicle_zev_code',
        queryset=ZevType.objects.all()
    )

    class Meta:
        model = Vehicle
        fields = (
            'id', 'make', 'model_name', 'model_year',
            'range',
            'vehicle_zev_type'
        )

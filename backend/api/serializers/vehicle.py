from enumfields.drf import EnumSupportSerializerMixin, EnumField
from rest_framework import serializers

from ..models.credit_value import CreditValue
from ..models.vehicle import Vehicle, ModelYear, VehicleDefinitionStates, VehicleChangeHistory
from ..services.vehicle import change_state


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


class VehicleStateChangeSerializer(serializers.ModelSerializer):

    state = EnumField(VehicleDefinitionStates)

    def update(self, instance, validated_data):
        change_state(self.context['request'].user, instance, validated_data.get('state'))
        return instance

    class Meta:
        model = Vehicle
        fields = ('state',)


class VehicleHistorySerializer(serializers.ModelSerializer, EnumSupportSerializerMixin):

    actor = serializers.SlugRelatedField(slug_field='username', read_only=True)
    current_state = EnumField(VehicleDefinitionStates, read_only=True)
    previous_state = EnumField(VehicleDefinitionStates, read_only=True)

    class Meta:
        model = VehicleChangeHistory
        fields = (
            'actor', 'current_state', 'previous_state', 'at'
        )


class VehicleSerializer(serializers.ModelSerializer, EnumSupportSerializerMixin):

    credit_value = CreditValueSerializer()
    type = serializers.SlugRelatedField(slug_field='name', read_only=True)
    make = serializers.SlugRelatedField(slug_field='name', read_only=True)
    model = serializers.SlugRelatedField(slug_field='name', read_only=True)
    trim = serializers.SlugRelatedField(slug_field='name', read_only=True)
    model_year = ModelYearSerializer()
    state = EnumField(VehicleDefinitionStates, read_only=True)
    changelog = VehicleHistorySerializer(read_only=True, many=True)
    actions = serializers.SerializerMethodField()

    def get_actions(self, instance):
        user = self.context['request'].user
        gov = self.context['request'].user.is_government

        actions = []

        if (gov and instance.state is VehicleDefinitionStates.SUBMITTED):
            actions.append('VALIDATED')
            actions.append('REJECTED')

        if (not gov and instance.state in [VehicleDefinitionStates.DRAFT, VehicleDefinitionStates.NEW]):
            actions.append('SUBMITTED')

        return actions

    class Meta:
        model = Vehicle
        fields = (
            'id', 'type', 'make', 'model', 'trim', 'state',
            'range', 'credit_value', 'model_year', 'changelog',
            'actions'
        )
        read_only_fields = ('state',)


from rest_framework.serializers import ModelSerializer
from api.models.icbc_vehicle import IcbcVehicle
from api.serializers.vehicle import ModelYearSerializer


class IcbcVehicleSerializer(ModelSerializer):
    model_year = ModelYearSerializer()

    class Meta:
        model = IcbcVehicle
        fields = ('id', 'make', 'model_name', 'model_year')

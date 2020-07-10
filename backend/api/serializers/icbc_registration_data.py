from rest_framework.serializers import ModelSerializer

from api.models.icbc_registration_data import IcbcRegistrationData
from api.serializers.icbc_vehicle import IcbcVehicleSerializer


class IcbcRegistrationDataSerializer(ModelSerializer):
    icbc_vehicle = IcbcVehicleSerializer(read_only=True)

    class Meta:
        model = IcbcRegistrationData
        fields = ('id', 'vin', 'icbc_vehicle')

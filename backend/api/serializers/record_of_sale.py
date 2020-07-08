from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.record_of_sale import RecordOfSale
from api.models.record_of_sale_statuses import RecordOfSaleStatuses
from api.models.vin_statuses import VINStatuses
from api.models.icbc_registration_data import IcbcRegistrationData
from api.serializers.vehicle import VehicleMinSerializer
from api.serializers.icbc_registration_data import IcbcRegistrationDataSerializer


class RecordOfSaleSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    validation_status = EnumField(RecordOfSaleStatuses, read_only=True)
    vin_validation_status = EnumField(VINStatuses, read_only=True)
    vehicle = VehicleMinSerializer(read_only=True)
    credits = SerializerMethodField()
    icbc_verification = SerializerMethodField()

    def get_icbc_verification(self, obj):
        icbc_data = IcbcRegistrationData.objects.filter(vin__iexact=obj.vin).first()
        if icbc_data:
            serializer = IcbcRegistrationDataSerializer(icbc_data)
            return serializer.data
        return None

    def get_credits(self, obj):
        return obj.vehicle.get_credit_value()

    class Meta:
        model = RecordOfSale
        fields = ('id', 'vin', 'reference_number', 'vehicle', 'sale_date',
                  'validation_status', 'vin_validation_status', 'credits',
                  'icbc_verification')

from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField

from api.models.record_of_sale import RecordOfSale
from api.models.record_of_sale_statuses import RecordOfSaleStatuses
from api.models.vin_statuses import VINStatuses
from api.serializers.vehicle import VehicleSerializer, VehicleMinSerializer


class RecordOfSaleSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    validation_status = EnumField(RecordOfSaleStatuses, read_only=True)
    vin_validation_status = EnumField(VINStatuses, read_only=True)
    vehicle = VehicleMinSerializer(read_only=True)

    class Meta:
        model = RecordOfSale
        fields = ('id', 'vin', 'reference_number', 'vehicle', 'sale_date',
                  'validation_status', 'vin_validation_status')

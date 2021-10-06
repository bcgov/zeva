from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.icbc_snapshot_data import IcbcSnapshotData
from api.serializers.icbc_vehicle import IcbcVehicleSerializer


class IcbcRegistrationDataSerializer(ModelSerializer):
    icbc_vehicle = IcbcVehicleSerializer(read_only=True)
    icbc_snapshot = SerializerMethodField()

    def get_icbc_snapshot(self, instance):
        submission_id = self.context.get('submission_id')

        snapshot = IcbcSnapshotData.objects.filter(
            vin=instance.vin,
            submission_id=submission_id
        ).first()

        if snapshot:
            return {
                'make': snapshot.make,
                'model_name': snapshot.model_name,
                'model_year': snapshot.model_year
            }

        return None

    class Meta:
        model = IcbcRegistrationData
        fields = ('id', 'vin', 'icbc_vehicle', 'icbc_snapshot')

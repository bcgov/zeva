from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.sales_submission_content import SalesSubmissionContent
from api.serializers.vehicle import VehicleMinSerializer
from api.serializers.icbc_registration_data import IcbcRegistrationDataSerializer
from api.services.sales_spreadsheet import get_date


class SalesSubmissionContentSerializer(ModelSerializer):
    sales_date = SerializerMethodField()
    vehicle = SerializerMethodField()
    icbc_verification = SerializerMethodField()

    def get_icbc_verification(self, obj):
        icbc_data = IcbcRegistrationData.objects.filter(
            vin__iexact=obj.xls_vin
        ).first()

        if icbc_data:
            serializer = IcbcRegistrationDataSerializer(icbc_data)
            return serializer.data

        return None

    def get_sales_date(self, instance):
        return get_date(
            instance.xls_sale_date,
            instance.xls_date_type,
            instance.xls_date_mode
        )

    def get_vehicle(self, instance):
        serializer = VehicleMinSerializer(instance.vehicle, read_only=True)

        return serializer.data

    class Meta:
        model = SalesSubmissionContent
        fields = (
            'id', 'sales_date', 'vehicle', 'xls_make', 'xls_model',
            'xls_model_year', 'xls_vin', 'icbc_verification',
        )
        read_only_fields = (
            'id',
        )

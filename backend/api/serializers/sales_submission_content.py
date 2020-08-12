from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission_content import SalesSubmissionContent
from api.serializers.vehicle import VehicleMinSerializer
from api.serializers.icbc_registration_data import \
    IcbcRegistrationDataSerializer
from api.services.sales_spreadsheet import get_date


class SalesSubmissionContentSerializer(ModelSerializer):
    sales_date = SerializerMethodField()
    vehicle = SerializerMethodField()

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
            'xls_model_year', 'xls_vin',
        )
        read_only_fields = (
            'id',
        )


class SalesSubmissionContentCheckedSerializer(ModelSerializer):
    sales_date = SerializerMethodField()
    vehicle = SerializerMethodField()
    icbc_verification = SerializerMethodField()
    checked = SerializerMethodField()
    errors = SerializerMethodField()

    def get_errors(self, instance):
        errors = ''

        if instance.is_already_awarded:
            errors += 'VIN validated before; '

        if instance.is_duplicate:
            errors += 'VIN contains duplicate in this set; '

        if errors == '':
            return None

        return errors

    def get_icbc_verification(self, instance):
        icbc_data = instance.icbc_verification

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

    def get_checked(self, instance):
        record_of_sale = RecordOfSale.objects.filter(
            submission_id=instance.submission_id,
            vin=instance.xls_vin
        ).first()

        if record_of_sale:
            return True

        return False

    def get_vehicle(self, instance):
        serializer = VehicleMinSerializer(instance.vehicle, read_only=True)

        return serializer.data

    class Meta:
        model = SalesSubmissionContent
        fields = (
            'id', 'sales_date', 'vehicle', 'xls_make', 'xls_model',
            'xls_model_year', 'xls_vin', 'icbc_verification',
            'checked', 'errors',
        )
        read_only_fields = (
            'id',
        )

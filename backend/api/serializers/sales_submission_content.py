from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField

from api.models.sales_submission_content import SalesSubmissionContent
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.vehicle import VehicleMinSerializer
from api.serializers.icbc_registration_data import \
    IcbcRegistrationDataSerializer
from api.serializers.record_of_sale import RecordOfSaleSerializer


class SalesSubmissionContentSerializer(ModelSerializer):
    icbc_verification = SerializerMethodField()
    record_of_sale = SerializerMethodField()
    vehicle = SerializerMethodField()
    warnings = SerializerMethodField()

    def get_icbc_verification(self, instance):
        request = self.context.get('request')
        icbc_data = instance.icbc_verification

        if request.user.is_government and icbc_data:
            serializer = IcbcRegistrationDataSerializer(icbc_data)
            return serializer.data

        return None

    def get_record_of_sale(self, instance):
        request = self.context.get('request')
        record_of_sale = instance.record_of_sale

        if record_of_sale and (
                request.user.is_government or
                instance.submission.validation_status ==
                SalesSubmissionStatuses.VALIDATED
        ):
            serializer = RecordOfSaleSerializer(
                instance.record_of_sale, read_only=True
            )

            return serializer.data

        return None

    def get_vehicle(self, instance):
        request = self.context.get('request')

        if instance.vehicle is not None:
            serializer = VehicleMinSerializer(
                instance.vehicle, read_only=True, context={'request': request}
            )

            return serializer.data

        return None

    def get_warnings(self, instance):
        request = self.context.get('request')

        if request.user.is_government or \
                instance.submission.validation_status == \
                SalesSubmissionStatuses.VALIDATED:
            return instance.warnings

        return None

    class Meta:
        model = SalesSubmissionContent
        fields = (
            'id', 'sales_date', 'vehicle', 'xls_make', 'xls_model',
            'xls_model_year', 'xls_vin', 'record_of_sale', 'sales_date',
            'warnings', 'icbc_verification',
        )
        read_only_fields = (
            'id',
        )

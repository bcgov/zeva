from rest_framework.serializers import ModelSerializer, SerializerMethodField
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.serializers.vehicle import VehicleMinSerializer
from api.serializers.icbc_registration_data import IcbcRegistrationDataSerializer
from api.serializers.record_of_sale import RecordOfSaleSerializer


class SalesSubmissionContentSerializer(ModelSerializer):
    icbc_verification = SerializerMethodField()
    record_of_sale = SerializerMethodField()
    vehicle = SerializerMethodField()

    def get_icbc_verification(self, instance):
        request = self.context.get("request")
        icbc_data = instance.icbc_verification

        if request.user.is_government and icbc_data:
            serializer = IcbcRegistrationDataSerializer(
                icbc_data, context={"submission_id": instance.submission.id}
            )
            return serializer.data

        return None

    def get_record_of_sale(self, instance):
        request = self.context.get("request")
        record_of_sale = instance.record_of_sale

        if record_of_sale and (
            request.user.is_government
            or instance.submission.validation_status
            == SalesSubmissionStatuses.VALIDATED
        ):
            serializer = RecordOfSaleSerializer(instance.record_of_sale, read_only=True)

            return serializer.data

        return None

    def get_vehicle(self, instance):
        request = self.context.get("request")

        if instance.vehicle is not None:
            serializer = VehicleMinSerializer(
                instance.vehicle, read_only=True, context={"request": request}
            )

            return serializer.data

        return None

    def get_warnings(self, instance):
        return instance.warnings

    class Meta:
        model = SalesSubmissionContent
        fields = (
            'id', 'sales_date', 'vehicle', 'xls_make', 'xls_model',
            'xls_model_year', 'xls_vin', 'record_of_sale', 'warnings', 
            'icbc_verification', 'reason', 'update_timestamp','warning_code', 
            'verified'
        )
        read_only_fields = ("id",)


class SalesSubmissionContentBulkSerializer(ModelSerializer):
    icbc_verification = SerializerMethodField()
    vehicle = SerializerMethodField()
    warnings = SerializerMethodField()

    def get_icbc_verification(self, instance):
        request = self.context.get("request")
        map_of_vins_to_icbc_data = self.context.get("warnings_and_maps").get(
            "map_of_vins_to_icbc_data"
        )
        icbc_data = map_of_vins_to_icbc_data.get(instance.xls_vin)

        if request.user.is_government and icbc_data is not None:
            serializer = IcbcRegistrationDataSerializer(
                icbc_data, context={"submission_id": instance.submission.id}
            )
            return serializer.data

        return None

    def get_vehicle(self, instance):
        request = self.context.get("request")
        map_of_sales_submission_content_ids_to_vehicles = self.context.get(
            "warnings_and_maps"
        ).get("map_of_sales_submission_content_ids_to_vehicles")
        vehicle = map_of_sales_submission_content_ids_to_vehicles.get(instance.id)
        if vehicle is not None:
            serializer = VehicleMinSerializer(
                vehicle, read_only=True, context={"request": request}
            )

            return serializer.data

        return None

    def get_warnings(self, instance):
        warnings_map = self.context.get("warnings_and_maps").get("warnings")
        warnings_list = warnings_map.get(instance.id)
        if warnings_list is None:
            return []
        return warnings_list

    class Meta:
        model = SalesSubmissionContent
        fields = (
            "id",
            "sales_date",
            "vehicle",
            "xls_make",
            "xls_model",
            "xls_model_year",
            "xls_vin",
            "sales_date",
            "warnings",
            "icbc_verification",
            "reason",
            "update_timestamp",
        )
        read_only_fields = ("id",)

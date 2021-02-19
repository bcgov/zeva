from rest_framework.serializers import ModelSerializer, \
    SlugRelatedField
from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.serializers.vehicle import VehicleZevTypeSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.serializers.credit_transaction import CreditClassSerializer
from api.models.vehicle_zev_type import ZevType
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.credit_class import CreditClass

class ModelYearReportVehicleSerializer(ModelSerializer):
    zev_class = CreditClassSerializer(read_only=True)
    model_year = ModelYearSerializer(read_only=True)
    zev_type = VehicleZevTypeSerializer(read_only=True)
    
    class Meta:
        model = ModelYearReportVehicle
        fields = (
            'id', 'pending_sales', 'sales_issued', 'make', 'model_name', 'range', 'zev_class', 'model_year', 'vehicle_zev_type','model_year_report'
        )

class ModelYearReportVehicleSaveSerializer(ModelSerializer):
    """
    Model Year Report Vehicle save serializer
    """
    zev_class = SlugRelatedField(
        slug_field='credit_class',
        queryset=CreditClass.objects.all()
    )
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    vehicle_zev_type = SlugRelatedField(
        slug_field='vehicle_zev_code',
        queryset=ZevType.objects.all()
    )

    def create(self, validated_data):
        request = self.context.get('request')
        model_id = request.data.get('model_year_report_id')
        
        model_year_report_vehicle = ModelYearReportVehicle.objects.create(
            **validated_data,
            model_year_report=ModelYearReport.objects.get(id=model_id)
        )
        return model_year_report_vehicle

    class Meta:
        model = ModelYearReportVehicle
        fields = (
            'pending_sales', 'sales_issued', 'make', 'model_name', 'range', 'zev_class', 'model_year', 'vehicle_zev_type', 'model_year_report_id'
        )
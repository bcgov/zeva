from django.core.exceptions import PermissionDenied
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField, ValidationError

from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.serializers.vehicle import ModelYearSerializer


class ModelYearReportSerializer(ModelSerializer):
    class Meta:
        model = ModelYearReport
        fields = (
            'organization_name', 'supplier_class', 'ldv_sales',
            'makes', 'organization_addresses',
        )


class ModelYearReportListSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    model_year = ModelYearSerializer()
    validation_status = EnumField(ModelYearReportStatuses)
    compliant = SerializerMethodField()
    obligation_total = SerializerMethodField()
    obligation_credits = SerializerMethodField()

    def get_compliant(self, obj):
        return True

    def get_obligation_total(self, obj):
        return 0

    def get_obligation_credits(self, obj):
        return 0

    class Meta:
        model = ModelYearReport
        fields = (	
            'model_year', 'validation_status', 'ldv_sales', 'supplier_class',
            'compliant', 'obligation_total', 'obligation_credits',
        )

"""
Account Balance Serializer
"""
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.model_year_report import ModelYearReport
from api.serializers.credit_transaction import CreditClassSerializer
from api.serializers.user import MemberSerializer
from api.models.organization import Organization
from api.models.model_year_report_statuses import ModelYearReportStatuses


class DashboardListSerializer(ModelSerializer):
    """
    Serializer for dashboard model year report
    """

    model_year_report_validation_status = SerializerMethodField()

    def get_model_year_report_validation_status(self, obj):
        request = self.context.get('request')
        if not request.user.is_government and obj.validation_status is ModelYearReportStatuses.RECOMMENDED:
            return ModelYearReportStatuses.SUBMITTED.value
        return obj.get_validation_status_display()

    class Meta:
        model = ModelYearReport
        fields = (
            'id', 'model_year_report_validation_status'
        )

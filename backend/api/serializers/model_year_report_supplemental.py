from enumfields.drf import EnumField
from rest_framework.serializers import ModelSerializer, SlugRelatedField

from api.models.supplemental_report import SupplementalReport
from api.models.supplemental_report_statuses import SupplementalReportStatuses


class ModelYearReportSupplementalSerializer(ModelSerializer):
    status = EnumField(SupplementalReportStatuses)

    class Meta:
        model = SupplementalReport
        fields = (
            'id', 'status',
        )

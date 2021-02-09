"""
Compliance Ratio Serializer
"""
from rest_framework.serializers import ModelSerializer

from api.models.compliance_ratio import ComplianceRatio


class ComplianceRatioSerializer(ModelSerializer):
    """
    Serializer Compliance Ratio
    """
    class Meta:
        model = ComplianceRatio
        fields = (
            'id', 'model_year', 'compliance_ratio', 'zev_class_a',
        )

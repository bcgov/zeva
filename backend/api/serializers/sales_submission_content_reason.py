"""
Sales Submission Content Reason Serializer
"""
from rest_framework.serializers import ModelSerializer

from api.models.sales_submission_content_reason import \
  SalesSubmissionContentReason


class SalesSubmissionContentReasonSerializer(ModelSerializer):
    """
    Serializer for sales submission content reasons
    """
    class Meta:
        model = SalesSubmissionContentReason
        fields = (
            'reason',
        )
        read_only_fields = (
            'reason',
        )

"""
Reason for Overriding ICBC Assessment Model
"""
from django.db import models

from auditable.models import Auditable


class SalesSubmissionContentReason(Auditable):
    """
    Contains the possible reasons why the assessment from ICBC is being
    overridden to include or exclude the VIN
    """
    reason = models.CharField(
        max_length=255,
        db_comment="Reason why the assessment is being overriden."
    )

    class Meta:
        db_table = 'sales_submission_content_reason'

    db_table_comment = \
        "Contains possible reasons for overriding the ICBC default status."

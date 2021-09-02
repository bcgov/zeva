"""
Supplemental Report Comment Model
"""
from django.db import models

from auditable.models import Auditable


class SupplementalReportComment(Auditable):
    """
    Contains comments made about the Supplemental Report
    """
    supplemental_report = models.ForeignKey(
        'SupplementalReport',
        related_name='supplemental_report_comment',
        on_delete=models.PROTECT,
        null=False
    )
    to_govt = models.BooleanField(
        default=False,
        db_comment="determines if comment is meant for governement"
    )
    comment = models.CharField(
        max_length=4000,
        blank=True,
        null=True,
        db_comment="Comment left by idir or bceid user about supplemental report"
    )

    class Meta:
        db_table = 'supplemental_report_comment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains comments made about the Supplemental Report"

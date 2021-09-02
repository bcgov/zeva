"""
Supplemental Assessment Comment Model
"""
from django.db import models

from auditable.models import Auditable


class SupplementalReportAssessmentComment(Auditable):
    """
    Contains comments made about the Model Year Assessment
    """
    supplemental_report = models.ForeignKey(
        'SupplementalReport',
        related_name='supplemental_report_assessment_comments',
        null=False,
        on_delete=models.PROTECT
    )
    to_director = models.BooleanField(
        default=False,
        db_comment="determines if comment is meant for director"
    )
    comment = models.CharField(
        max_length=4000,
        blank=True,
        null=True,
        db_column='assessment_comment',
        db_comment="Comment left by idir about supplemental report"
    )

    class Meta:
        db_table = 'supplemental_report_assessment_comment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains comments made about the Supplemental Report Assessment"\
        "from analyst to director and from analyst to supplier"

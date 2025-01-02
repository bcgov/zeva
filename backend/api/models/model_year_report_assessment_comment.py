"""
Model Year Assessment Comment Model
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportAssessmentComment(Auditable):
    """
    Contains comments made about the Model Year Assessment
    """
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='model_year_report_assessment_comments',
        null=False,
        on_delete=models.PROTECT
    )
    to_director = models.BooleanField(
        default=False,
        db_comment="determines if comment is meant for director"
    )
    comment = models.TextField(
        blank=True,
        null=True,
        db_column='assessment_comment',
        db_comment="Comment left by idir about model year report"
    )
    display = models.BooleanField(
        default=True,
        db_comment="field to determine if we should display this info"
    )

    class Meta:
        db_table = 'model_year_report_assessment_comment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains comments made about the Model Year Assessment"\
        "from analyst to director and from analyst to supplier"

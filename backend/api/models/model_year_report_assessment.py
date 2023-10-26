"""
Model Year Assessment Comment Model
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportAssessment(Auditable):
    """
    Contains selection that analyst has made for whether supplier has complied
    and if not the amount penalized
    """
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='model_year_report_assessment',
        null=False,
        on_delete=models.PROTECT
    )
    model_year_report_assessment_description = models.ForeignKey(
        'ModelYearReportAssessmentDescriptions',
        related_name='+',
        null=False,
        on_delete=models.PROTECT
    )
    penalty = models.DecimalField(
        null=True,
        max_digits=20,
        decimal_places=2,
        db_comment='amount of administrative penalty'
    )
    display = models.BooleanField(
        default=True,
        db_comment="field to determine if we should display this info"
    )

    class Meta:
        db_table = 'model_year_report_assessment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains Model Year Assessment description as selected" \
        "by analyst and penalty amount if applicable"

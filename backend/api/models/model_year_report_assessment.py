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
        max_digits=20,
        decimal_places=2,
        db_comment='amount of administrative penalty'
    )

    class Meta:
        db_table = 'model_year_report_assessment_comment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains comments made about the Model Year Assessment" \
        "from analyst to director and from analyst to supplier"

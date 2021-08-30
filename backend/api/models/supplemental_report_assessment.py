"""
Supplemental Assessment Comment Model
"""
from django.db import models

from auditable.models import Auditable


class SupplementalReportAssessment(Auditable):
    """
    Contains selection that analyst has made for whether supplier has complied
    and if not the amount penalized
    """
    supplemental_report = models.ForeignKey(
        'SupplementalReport',
        related_name='supplemental_assessment',
        null=False,
        on_delete=models.PROTECT
    )
    supplemental_report_assessment_description = models.ForeignKey(
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

    class Meta:
        db_table = 'supplemental_report_assessment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains Supplemental Report Assessment description as selected" \
        "by analyst and penalty amount if applicable"

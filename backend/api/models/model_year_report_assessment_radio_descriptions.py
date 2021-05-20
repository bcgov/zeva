"""
Model Year Assessment Comment Model
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportAssessmentRadioDescriptions(Auditable):
    """
    contains descriptions for the 3 options for the assessment
    radio buttons
    """

    description = models.CharField(
        max_length=4000,
        blank=True,
        null=True,
        db_column='assessment_radio_description',
        db_comment="descriptions of the assessment radio options"
    )

    class Meta:
        db_table = 'model_year_report_assessment_radio_descriptions'
        ordering = ['create_timestamp']

    db_table_comment = \
        "a lookup table for descriptions of the assessment" \
        "radio options"

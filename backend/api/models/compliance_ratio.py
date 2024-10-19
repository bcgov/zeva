"""
Compliance Ratio Model
"""
from django.db import models

from auditable.models import Auditable


class ComplianceRatio(Auditable):
    """
    Table to store compliance ratio based on model year
    """

    model_year = models.CharField(
        max_length=250,
        db_comment='model year'
    )
    compliance_ratio = models.DecimalField(
        blank=False,
        decimal_places=2,
        max_digits=20,
        db_comment="Containes the compliance ratio percentage for for each model year for light-duty motor vehicle class."
    )
    zev_class_a = models.DecimalField(
        blank=False,
        decimal_places=2,
        max_digits=20,
        db_comment="Contains the compliance ratio percentage for ZEV Class A vehicles in the light-duty motor vehicle class."
    )

    class Meta:
        db_table = "compliance_ratio"
        ordering = ['model_year']

    db_table_comment = "Table to store compliance ratio based on model year"

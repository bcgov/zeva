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
    compliance_ratio = models.CharField(
        max_length=250,
        db_comment="compliance ratio that doesn't specify ZEV class"
    )
    zev_class_a = models.CharField(
        max_length=250,
        db_comment="compliance ratio for ZEV class A"
    )

    class Meta:
        db_table = "compliance_ratio"

    db_table_comment = "Table to store compliance ratio based on model year"

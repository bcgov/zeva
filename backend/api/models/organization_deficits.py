"""
Organization Deficits
"""
from django.db import models

from auditable.models import Auditable


class OrganizationDeficits(Auditable):
    """
    Table to store the organization's deficits
    """
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    credit_class = models.ForeignKey(
        'CreditClass',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )
    credit_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='Amount of credits in deficit'
    )
    organization = models.ForeignKey(
        'Organization',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )

    class Meta:
        db_table = "organization_deficits"

    db_table_comment = "Table to store the organization's deficits"

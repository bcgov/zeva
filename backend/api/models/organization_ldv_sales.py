"""
Organization LDV Sales
"""
from django.db import models

from auditable.models import Auditable


class OrganizationLDVSales(Auditable):
    """
    Table to store the organization's LDV Sales/Leases
    """
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    ldv_sales = models.IntegerField(
        blank=False,
        db_comment="Contains the LDV sales/leases for the organization "
                   ".circleci/categorized by year."
    )
    organization = models.ForeignKey(
        'Organization',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    is_supplied = models.BooleanField(
        default=False
    )

    class Meta:
        db_table = "organization_ldv_sales"

    db_table_comment = "Table to store the organization's LDV Sales/Leases"

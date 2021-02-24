"""
Model Year Report Addresses
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportAddress(Auditable):
    """
    Supplier addresses available during the time the report was created.
    """
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='model_year_report_addresses',
        on_delete=models.PROTECT
    )
    representative_name = models.CharField(
        blank=True,
        max_length=100,
        null=True,
        db_comment="optional name of representative (eg attorney)"
    )
    address_type = models.ForeignKey(
        'AddressType',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )
    address_line_1 = models.CharField(
        blank=True,
        max_length=500,
        null=True,
        db_comment="The first line of the organization's address"
    )
    address_line_2 = models.CharField(
        blank=True,
        max_length=100,
        null=True,
        db_comment="The second line of the organization's address"
    )
    address_line_3 = models.CharField(
        blank=True,
        max_length=100,
        null=True,
        db_comment="The third line of the organization's address"
    )
    city = models.CharField(
        blank=True,
        max_length=100,
        null=True,
        db_comment="City"
    )
    postal_code = models.CharField(
        blank=True,
        max_length=10,
        null=True,
        db_comment="Postal Code"
    )
    state = models.CharField(
        blank=True,
        max_length=50,
        null=True,
        db_comment="State or Province"
    )
    county = models.CharField(
        blank=True,
        max_length=50,
        null=True,
        db_comment="County Name"
    )
    country = models.CharField(
        blank=True,
        max_length=100,
        null=True,
        db_comment="Country"
    )
    other = models.CharField(
        blank=True,
        max_length=100,
        null=True,
        db_comment="Other Address Details"
    )

    class Meta:
        db_table = 'model_year_report_address'

    db_table_comment = "Supplier addresses available during the time the " \
                       "report was created."

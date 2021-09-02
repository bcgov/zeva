"""
Supplemental Report Supplier Information Model
"""
from django.db import models

from auditable.models import Auditable


class SupplementalReportSupplierInformation(Auditable):
    """
    Table containes supplemetal report's supplier information 
    """

    supplemental_report = models.ForeignKey(
        'SupplementalReport',
        related_name='supplemental_report_supplier_information',
        on_delete=models.PROTECT,
        null=False
    )
    category = models.CharField(
        blank=True,
        db_comment="Category (eg. LEGAL_NAME, SERVICE_ADDRESS, RECORDS_ADDRESS, LDV_MAKES, SUPPLIER_CLASS",
        null=True,
        max_length=250
    )
    value = models.CharField(
        blank=True,
        null=True,
        max_length=500
    )

    class Meta:
        db_table = "supplemental_report_supplier_information"

    db_table_comment = "Table containes supplemetal report's supplier information"

"""
Model Year Report
"""
from django.db import models
from enumfields import EnumField

from auditable.models import Auditable
from api.models.model_year_report_statuses import ModelYearReportStatuses


class ModelYearReport(Auditable):
    """
    Model Year Report container. This will serve as the parent table for
    content of the report.
    Flat information goes here such as Supplier Class and organizatio name.
    While makes and other multiple rows table will reference this table
    """
    organization_name = models.CharField(
        db_comment="Name of the organization when the report was generated",
        max_length=500,
        null=False
    )
    supplier_class = models.CharField(
        db_comment="Supplier Class: S - Small, M - Medium, L - Large",
        max_length=1,
        null=False
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    validation_status = EnumField(
        ModelYearReportStatuses,
        max_length=20,
        null=False,
        default=ModelYearReportStatuses.DRAFT,
        db_comment="The validation status of this model year report. "
                   "Valid statuses: {statuses}".format(
                       statuses=[c.name for c in ModelYearReportStatuses]
                   )
    )
    ldv_sales = models.DecimalField(
        null=True,
        decimal_places=2,
        max_digits=20,
        db_comment="Contains the LDV Sales/Leases information for model year"
    )
    

    class Meta:
        db_table = 'model_year_report'

    db_table_comment = "Model Year Report container"

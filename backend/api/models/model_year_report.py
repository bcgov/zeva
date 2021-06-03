"""
Model Year Report
"""
from django.db import models
from enumfields import EnumField

from auditable.models import Auditable
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_ldv_sales import ModelYearReportLDVSales


class ModelYearReport(Auditable):
    """
    Model Year Report container. This will serve as the parent table for
    content of the report.
    Flat information goes here such as Supplier Class and organizatio name.
    While makes and other multiple rows table will reference this table
    """
    organization = models.ForeignKey(
        'Organization',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    organization_name = models.CharField(
        db_comment="Name of the organization when the report was generated",
        max_length=500,
        null=False
    )
    supplier_class = models.CharField(
        db_comment="Supplier Class: S - Small, M - Medium, L - Large",
        max_length=1,
        null=True
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

    @property
    def makes(self):
        data = ModelYearReportMake.objects.filter(
            model_year_report_id=self.id
        )

        return data

    @property
    def ldv_sales(self):
        return self.get_ldv_sales(from_gov=False)

    def get_ldv_sales(self, from_gov=False):
        row = ModelYearReportLDVSales.objects.filter(
            model_year_id=self.model_year_id,
            model_year_report_id=self.id,
            from_gov=from_gov
        ).first()

        if row:
            return row.ldv_sales

        return None

    class Meta:
        db_table = 'model_year_report'

    db_table_comment = "Model Year Report contains details of light duty " \
                       "vehicle sales as submitted by the supplier each " \
                       "model year in order to demonstrate regulatory " \
                       "compliance."

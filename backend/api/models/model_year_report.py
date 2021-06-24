"""
Model Year Report
"""
from django.db import models
from enumfields import EnumField

from auditable.models import Auditable
from api.models.model_year_report_adjustment import ModelYearReportAdjustment
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_ldv_sales import ModelYearReportLDVSales
from api.models.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligation


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
    credit_reduction_selection = models.CharField(
        db_comment="Which ZEV credit class to use first for unspecified "
                   "reductions. (A or B)",
        max_length=1,
        null=True
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

    @property
    def adjustments(self):
        data = ModelYearReportAdjustment.objects.filter(
            model_year_report_id=self.id
        )

        return data

    def get_avg_sales(self):
        avg_sales = self.organization.get_avg_ldv_sales(
            year=self.model_year.name
        )

        # if this is empty that means we don't have enough ldv_sales to
        # get the average. our avg_sales at this point should be from the
        # current report ldv_sales
        if not avg_sales:
            report_ldv_sales = ModelYearReportLDVSales.objects.filter(
                model_year_report_id=self.id,
                model_year_id=self.model_year_id
            ).order_by('-update_timestamp').first()

            if report_ldv_sales:
                avg_sales = report_ldv_sales.ldv_sales

        return avg_sales

    def get_ldv_sales(self, from_gov=False):
        row = ModelYearReportLDVSales.objects.filter(
            model_year_id=self.model_year_id,
            model_year_report_id=self.id,
            from_gov=from_gov
        ).first()
        if row:
            return row.ldv_sales
        return None
        
    def get_ldv_sales_with_year(self, from_gov=False):
        row = ModelYearReportLDVSales.objects.filter(
            model_year_id=self.model_year_id,
            model_year_report_id=self.id,
            from_gov=from_gov
        ).first()
        if row:
            return {'sales': row.ldv_sales, 'year': row.model_year.name}
        return None

    def get_credit_reductions(self, year):
        data = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=self.id,
            model_year__name=year,
            category__in=[
                'ClassAReduction', 'UnspecifiedClassCreditReduction',
                'CreditDeficit', 'ProvisionalBalanceAfterCreditReduction'
            ]
        )

        if data:
            return data

        return None

    class Meta:
        db_table = 'model_year_report'

    db_table_comment = "Model Year Report contains details of light duty " \
                       "vehicle sales as submitted by the supplier each " \
                       "model year in order to demonstrate regulatory " \
                       "compliance."

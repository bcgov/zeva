"""
Model Year Report
"""
from django.db import models
from django.db.models import Q
from enumfields import EnumField

from auditable.models import Auditable
from api.models.model_year_report_adjustment import ModelYearReportAdjustment
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_ldv_sales import ModelYearReportLDVSales
from api.models.model_year_report_compliance_obligation import \
    ModelYearReportComplianceObligation
from api.models.supplemental_report import SupplementalReport
from api.models.supplemental_report_history import SupplementalReportHistory
from api.models.user_profile import UserProfile


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
        return self.get_ldv_sales(from_gov=False, display=True)

    @property
    def adjustments(self):
        data = ModelYearReportAdjustment.objects.filter(
            model_year_report_id=self.id
        )

        return data

    @property
    def supplemental(self):
        return SupplementalReport.objects.filter(
            model_year_report_id=self.id
        ).order_by('-update_timestamp').first()
        

    def get_latest_supplemental(self, request):
        supplemental_report_ids = SupplementalReport.objects.filter(
            model_year_report_id=self.id,
            status__in=[
                ModelYearReportStatuses.SUBMITTED,
                ModelYearReportStatuses.DRAFT,
                ModelYearReportStatuses.RECOMMENDED,
                ModelYearReportStatuses.ASSESSED,
                ModelYearReportStatuses.REASSESSED,
                ModelYearReportStatuses.RETURNED,
            ]
        ).values_list('id', flat=True)

        SubQuery = UserProfile.objects.filter(organization__is_government=True).values_list('username', flat=True)
        if request.user.is_government:
            supplemental_report = SupplementalReportHistory.objects.filter(
                supplemental_report_id__in=supplemental_report_ids,
                validation_status__in=[
                    ModelYearReportStatuses.SUBMITTED,
                    ModelYearReportStatuses.DRAFT,
                    ModelYearReportStatuses.RECOMMENDED,
                    ModelYearReportStatuses.ASSESSED,
                    ModelYearReportStatuses.REASSESSED,
                    ModelYearReportStatuses.RETURNED,
                    ]
            ).exclude(Q(~Q(create_user__in=SubQuery) & (Q(validation_status=ModelYearReportStatuses.DRAFT)))).order_by('-update_timestamp')

            # Exclude reports returned to suppliers
            exclude_return = []

            for index, report in enumerate(supplemental_report):
                if report.validation_status.value == 'RETURNED' and \
                        index + 1 < len(supplemental_report):
                    if supplemental_report[index + 1].validation_status.value == 'SUBMITTED':
                        exclude_return.append(report.id)
                        exclude_return.append(supplemental_report[index + 1].id)

            supplemental_report = supplemental_report.exclude(id__in=exclude_return)
        else:
            supplemental_report = SupplementalReportHistory.objects.filter(
                supplemental_report_id__in=supplemental_report_ids,
                validation_status__in=[
                    ModelYearReportStatuses.SUBMITTED,
                    ModelYearReportStatuses.DRAFT,
                    ModelYearReportStatuses.ASSESSED,
                    ModelYearReportStatuses.REASSESSED,
                    ModelYearReportStatuses.RETURNED,

                    ]
            ).exclude(Q(Q(create_user__in=SubQuery) & (Q(validation_status=ModelYearReportStatuses.DRAFT)))).order_by('-update_timestamp')

        history = supplemental_report.first()

        if history:
            return SupplementalReport.objects.filter(
                id=history.supplemental_report_id
            ).first()

        return None

    def get_supplemental(self, supplemental_id):
        return SupplementalReport.objects.filter(
            model_year_report_id=self.id,
            id=supplemental_id
        ).first()

    def get_assessed_supplementals(self):
        return SupplementalReport.objects.filter(
            model_year_report_id=self.id,
            status=ModelYearReportStatuses.ASSESSED
        ).order_by("create_timestamp")

    def get_previous_model_report(self):
        return ModelYearReport.objects.filter(
            organization=self.organization
        ).filter(
            model_year__name=int(self.model_year.name) - 1
        ).first()

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
                model_year_id=self.model_year_id,
                display=True
            ).order_by('-update_timestamp').first()

            if report_ldv_sales:
                avg_sales = report_ldv_sales.ldv_sales

        return avg_sales

    def get_ldv_sales(self, from_gov=False, display=True):
        row = ModelYearReportLDVSales.objects.filter(
            model_year_id=self.model_year_id,
            model_year_report_id=self.id,
            from_gov=from_gov,
            display=display
        ).first()
        if row:
            return row.ldv_sales
        return None

    def get_ldv_sales_with_year(self, from_gov=False, display=True):
        row = ModelYearReportLDVSales.objects.filter(
            model_year_id=self.model_year_id,
            model_year_report_id=self.id,
            from_gov=from_gov,
            display=display
        ).first()
        if row:
            return {'sales': row.ldv_sales, 'year': row.model_year.name}
        return None

    def get_credit_reductions(self):
        data = ModelYearReportComplianceObligation.objects.filter(
            model_year_report_id=self.id,
            category__in=[
                'ClassAReduction', 'UnspecifiedClassCreditReduction',
                'CreditDeficit', 'ProvisionalBalanceAfterCreditReduction',
                'ReductionsToOffsetDeficit'
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

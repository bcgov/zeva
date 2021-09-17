"""
Supplemental Report Model
"""
from django.db import models

from auditable.models import Auditable
from enumfields import EnumField
from api.models.model_year_report_statuses import ModelYearReportStatuses


class SupplementalReport(Auditable):
    """
    Supplemental report table containes reference to the original model year report and it will be used as the reference for the other supplemental reort tables
    """

    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='supplemental_report',
        on_delete=models.PROTECT,
        null=False
    )
    ldv_sales = models.IntegerField(
        null=True,
        db_comment="Contains the LDV sales/leases data based on supplemental report."
    )
    status = EnumField(
        ModelYearReportStatuses,
        max_length=20,
        null=False,
        default=ModelYearReportStatuses.DRAFT,
        db_comment="The validation status of this supplemental report."
                   "Valid statuses: {statuses}".format(
                       statuses=[c.name for c in ModelYearReportStatuses]
                   )
    )
    supplemental_id = models.IntegerField(
        null=True,
        blank=True,
        db_comment="This will reference the previous supplemental report that the analyst was reviewing."
    )

    class Meta:
        db_table = "supplemental_report"

    db_table_comment = "Supplemental report table containes"\
                       "reference to the original model year"\
                       "report and it will be used as the reference"\
                       "for the other supplemental reort tables"

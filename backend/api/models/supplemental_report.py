"""
Supplemental Report Model
"""
from django.db import models

from auditable.models import Auditable
from enumfields import EnumField
from api.models.supplemental_report_statuses import SupplementalReportStatuses


class SupplementalReport(Auditable):
    """
    Supplemental report table containes reference to the original model year report and it will be used as the reference for the other supplemental reort tables
    """

    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    status = EnumField(
        SupplementalReportStatuses,
        max_length=20,
        null=False,
        default=SupplementalReportStatuses.DRAFT,
        db_comment="The validation status of this supplemental report."
                   "Valid statuses: {statuses}".format(
                       statuses=[c.name for c in SupplementalReportStatuses]
                   )
    )

    class Meta:
        db_table = "supplemental_report"

    db_table_comment = "Supplemental report table containes"\
                       "reference to the original model year"\
                       "report and it will be used as the reference"\
                       "for the other supplemental reort tables"

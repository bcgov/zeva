from django.db import models
from enumfields import EnumField

from auditable.models import Auditable
from api.models.model_year_report_statuses import ModelYearReportStatuses


class SupplementalReportHistory(Auditable):
    supplemental_report = models.ForeignKey(
        'SupplementalReport',
        related_name='supplemental_report_history',
        on_delete=models.PROTECT
    )
    validation_status = EnumField(
        ModelYearReportStatuses,
        max_length=20,
        null=False,
        default=ModelYearReportStatuses.DRAFT,
        db_comment="The validation status of this supplemental report. "
                   "Valid statuses: {statuses}".format(
                       statuses=[c.name for c in ModelYearReportStatuses]
                   )
    )

    class Meta:
        db_table = "supplemental_report_history"

    db_table_comment = "history of supplemental report statuses"

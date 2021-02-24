from django.db import models
from enumfields import EnumField

from auditable.models import Auditable
from api.models.model_year_report_statuses import ModelYearReportStatuses


class ModelYearReportHistory(Auditable):
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='model_year_report_history',
        on_delete=models.PROTECT
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

    class Meta:
        db_table = "model_year_report_history"

    db_table_comment = "history of model year report statuses"

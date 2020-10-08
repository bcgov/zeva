from django.db import models
from enumfields import EnumField

from auditable.models import Auditable
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_statuses import SalesSubmissionStatuses


class SalesSubmissionHistory(Auditable):
    submission =  models.ForeignKey(
        'SalesSubmission',
        related_name=None,
        on_delete=models.PROTECT
    )
    validation_status = EnumField(
            SalesSubmissionStatuses,
            max_length=20,
            null=False,
            default=SalesSubmissionStatuses.DRAFT,
            db_comment="The validation status of this sales submission. "
                    "Valid statuses: {statuses}".format(
                        statuses=[c.name for c in SalesSubmissionStatuses]
                    )
        )

    class Meta:
        db_table = "sales_submission_history"
    db_table_comment = "history of sales submissions"

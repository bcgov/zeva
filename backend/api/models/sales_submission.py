from django.db import models
from enumfields import EnumField

from api.models.mixins.named import UniquelyNamed
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from auditable.models import Auditable


class SalesSubmission(Auditable, UniquelyNamed):

    organization = models.ForeignKey(
        'Organization',
        related_name='submissions',
        on_delete=models.CASCADE
    )

    submission_date = models.DateField(
        blank=True,
        null=True,
        auto_now=True,
        db_comment="The calendar date the submission was entered in ZEVA"
    )

    validation_status = EnumField(
        SalesSubmissionStatuses,
        max_length=20,
        null=False,
        default=SalesSubmissionStatuses.NEW,
        db_comment="The validation status of this sales submission. Valid statuses: "
                   "{statuses}".format(
            statuses=[c.name for c in SalesSubmissionStatuses]
        )
    )

    class Meta:
        db_table = "sales_submission"

    db_table_comment = 'Stores information related to batches of record of sales submissions (such as what the' \
                       ' status of the submission, the date it was entered, and which organization submitted it. '

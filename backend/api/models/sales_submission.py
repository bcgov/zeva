from django.db import models
from enumfields import EnumField

from api.models.sales_submission_statuses import SalesSubmissionStatuses
from auditable.models import Auditable


class SalesSubmission(Auditable):
    organization = models.ForeignKey(
        'Organization',
        related_name='submissions',
        on_delete=models.CASCADE
    )

    submission_date = models.DateField(
        blank=True,
        null=True,
        auto_now_add=True,
        db_comment="The calendar date the submission was created in ZEVA"
    )

    submission_sequence = models.CharField(
        blank=False,
        null=True,
        max_length=3,
        db_comment=''
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

    @property
    def submission_id(self):

        formatted_date = self.submission_date.strftime("%y%m%d")
        best_name = self.organization.short_name if self.organization.short_name else self.organization.name

        if self.submission_sequence is None:
            return '{org}{date}'.format(org=best_name,
                                        date=formatted_date)

        return '{org}{date}{seq}'.format(org=best_name,
                                         date=formatted_date,
                                         seq=self.submission_sequence)


    @staticmethod
    def next_sequence(org, date):
        count = SalesSubmission.objects.filter(organization=org,
                                               submission_date=date).count()
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

        if count == 0:
            return None

        x = count

        seq = ''

        while True:
            x = x - 1
            seq = chars[x % len(chars)] + seq

            if x < len(chars):
                break

            x = x // len(chars)

        return seq

    class Meta:
        db_table = "sales_submission"
        unique_together = [('submission_date', 'submission_sequence', 'organization')]

    db_table_comment = 'Stores information related to batches of record of sales submissions (such as what the' \
                       ' status of the submission, the date it was entered, and which organization submitted it. '

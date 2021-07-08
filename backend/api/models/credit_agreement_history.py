from django.db import models
from enumfields import EnumField

from auditable.models import Auditable
from . credit_agreement_statuses import CreditAgreementStatuses


class CreditAgreementHistory(Auditable):
    credit_agreement = models.ForeignKey(
        'CreditAgreement',
        null=False,
        related_name='credit_agreement_history',
        on_delete=models.PROTECT
    )
    status = EnumField(
        CreditAgreementStatuses,
        max_length=20,
        null=False,
        default=CreditAgreementStatuses.DRAFT,
        db_comment="The validation status of this credit agreement. "
                   "Status remains unchanged if the user is just adding a "
                   "comment, but will generated a new record anyway."
                   "Valid statuses: {statuses}".format(
                       statuses=[c.name for c in CreditAgreementStatuses]
                   )
    )

    class Meta:
        db_table = "credit_agreement_history"
    db_table_comment = "credit agreement history"

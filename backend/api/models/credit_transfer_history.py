from django.db import models
from enumfields import EnumField

from auditable.models import Auditable
from api.models.credit_transfer_statuses import CreditTransferStatuses


class CreditTransferHistory(Auditable):
    transfer = models.ForeignKey(
        'CreditTransfer',
        related_name='history',
        on_delete=models.PROTECT
    )
    status = EnumField(
        CreditTransferStatuses,
        max_length=20,
        null=False,
        default=CreditTransferStatuses.DRAFT,
        db_comment="The validation status of this credit transfer. "
                   "Status remains unchanged if the user is just adding a "
                   "comment, but will generated a new record anyway."
                   "Valid statuses: {statuses}".format(
                       statuses=[c.name for c in CreditTransferStatuses]
                   )
    )

    class Meta:
        db_table = "credit_transfer_history"
    db_table_comment = "credit transfer history"

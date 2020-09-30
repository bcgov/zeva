"""
Credit Transfer Model
"""
from django.db import models
from enumfields import EnumField

from auditable.models import Auditable
from .credit_transfer_statuses import CreditTransferStatuses


class CreditTransfer(Auditable):
    """
    A ledger of all recorded credit transfers between suppliers
    """
    credit_to = models.ForeignKey(
        'Organization',
        related_name='+',
        on_delete=models.PROTECT
    )
    debit_from = models.ForeignKey(
        'Organization',
        related_name='+',
        on_delete=models.PROTECT
    )
    status = EnumField(
        CreditTransferStatuses,
        max_length=20,
        null=False,
        default=CreditTransferStatuses.DRAFT,
        db_comment="The validation status of this transfer. "
                   "Valid statuses: {statuses}".format(
                       statuses=[c.name for c in CreditTransferStatuses]
                   )
    )

    class Meta:
        db_table = "credit_transfer"

    db_table_comment = "A ledger of credit transfers between suppliers "

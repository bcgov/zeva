"""
Credit Transfer Model
"""
from django.db import models

from auditable.models import Auditable
from enumfields import EnumField
from .credit_transfer_statuses import CreditTransferStatuses


class CreditTransfer(Auditable):
    """
    A ledger of all recorded credit transfers between suppliers
    """
    to_supplier = models.ForeignKey(
        'Organization',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )
    from_supplier = models.ForeignKey(
        'Organization',
        related_name='+',
        on_delete=models.PROTECT,
        null=False
    )
    credit_class = models.ForeignKey(
        'CreditClass',
        related_name='+',
        on_delete=models.PROTECT,
        null=False,
        db_comment='Type of credit (a or b)'
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    number_of_credits = models.IntegerField(
        db_comment='number of credits transferred'
    )
    value_per_credit = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='The value in dollars for each credit transferred'
    )
    total_value = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment='number of credits transferred'
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

    def get_total_value(self):
        """
        Gets the total value of the credits
        """
        return self.number_of_credits * self.value_per_credit

    class Meta:
        db_table = "credit_transfer"

    db_table_comment = "A ledger of credit transfers between suppliers "

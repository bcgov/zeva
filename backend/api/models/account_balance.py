from django.db import models

from api.models.mixins.effective_dates import EffectiveDates
from auditable.models import Auditable


class AccountBalance(Auditable, EffectiveDates):
    balance = models.DecimalField(
        db_comment="balance",
        max_digits=20,
        decimal_places=2,
        default=0,
        null=False
    )

    credit_class = models.ForeignKey(
        'CreditClass',
        related_name="+",
        on_delete=models.PROTECT,
        null=False
        )

    organization = models.ForeignKey(
        'Organization',
        related_name="+",
        on_delete=models.PROTECT,
        null=False
    )

    credit_transaction = models.ForeignKey(
        'CreditTransaction',
        related_name="+",
        on_delete=models.PROTECT,
        null=True
    )

    class Meta:
        db_table = "account_balance"

    db_table_comment = "account balances. A and B class credits"  \
                       "are kept as separate records."

from django.db import models
from auditable.models import Auditable
from api.models.credit_transaction import CreditTransaction
from api.models.supplemental_report import SupplementalReport


class BackdatedCreditTransaction(Auditable):
    credit_transaction = models.OneToOneField(
        CreditTransaction,
        on_delete=models.CASCADE,
        related_name="backdated_credit_transaction",
    )

    compliance_year = models.IntegerField()

    accounted_for_in_supplemental = models.BooleanField()

    accounted_for_in_model_year_report = models.BooleanField()

    class Meta:
        db_table = "backdated_credit_transaction"

    db_table_comment = "keeps track of backdated credit transactions"

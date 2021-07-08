from django.db import models
from enumfields import EnumField
from auditable.models import Auditable
from . credit_agreement_statuses import CreditAgreementStatuses
from . credit_agreement_transaction_types import CreditAgreementTransactionTypes


class CreditAgreement(Auditable):

    organization = models.ForeignKey(
        'Organization',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    transaction_type = EnumField(
        CreditAgreementTransactionTypes,
        max_length=50,
        null=False,
        default=CreditAgreementTransactionTypes.INITIATIVE_AGREEMENT,
        db_comment="The transaction type of this credit agreement. "
                   "Valid transaction types: {transaction_types}".format(
                       transaction_types=[c.name for c in CreditAgreementTransactionTypes]
                   )
    )
    status = EnumField(
        CreditAgreementStatuses,
        max_length=20,
        null=False,
        default=CreditAgreementStatuses.DRAFT,
        db_comment="The validation status of this credit agreement. "
                   "Valid statuses: {statuses}".format(
                       statuses=[c.name for c in CreditAgreementStatuses]
                   )
    )
    effective_date = models.DateField(
        blank=True,
        null=True,
        auto_now_add=True,
        db_comment="The calendar date the credit agreement created"
    )

    class Meta:
        db_table = 'credit_agreement'

    db_table_comment = "Credit Agreement containes details of credit adjustments agreements created by government"
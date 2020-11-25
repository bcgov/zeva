from django.db import models

from auditable.models import Auditable


class SigningAuthorityConfirmation(Auditable):
    has_accepted = models.BooleanField(
        db_comment='Flag. True if the associated confirmation was accepted.'
    )
    credit_transfer = models.ForeignKey(
        'CreditTransfer',
        null=True,
        related_name='confirmations',
        on_delete=models.DO_NOTHING
    )
    signing_authority_assertion = models.ForeignKey(
        'SigningAuthorityAssertion',
        related_name='confirmations',
        on_delete=models.PROTECT
    )
    title = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_comment="Title of the user who acccepted the assertion."
    )

    class Meta:
        db_table = 'signing_authority_confirmation'

    db_table_comment = "Contains a history of assertions having been " \
                       "accepted by the bceid user."

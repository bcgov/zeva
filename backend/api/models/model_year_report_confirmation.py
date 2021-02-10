from django.db import models

from auditable.models import Auditable


class ModelYearReportConfirmation(Auditable):
    """
    Signing Authority Confirmations for Model Year Report
    """
    has_accepted = models.BooleanField(
        db_comment='Flag. True if the associated confirmation was accepted.'
    )
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        null=True,
        related_name='model_year_report_confirmations',
        on_delete=models.DO_NOTHING
    )
    signing_authority_assertion = models.ForeignKey(
        'SigningAuthorityAssertion',
        related_name='model_year_report_confirmations',
        on_delete=models.PROTECT
    )
    title = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_comment="Title of the user who acccepted the assertion."
    )

    class Meta:
        db_table = 'model_year_report_confirmation'

    db_table_comment = "Contains a history of assertions having been " \
                       "accepted by the bceid user for model year reports."

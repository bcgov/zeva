"""
Model Year Report Makes
"""
from django.db import models

from auditable.models import Auditable


class ModelYearReportMake(Auditable):
    """
    Makes available during the time the report was created.
    This will need to record all the makes that were available during the time
    the report was created. As well as allow adding additional makes for ICE
    vehicles.
    We'll also allow users to remove makes they think shouldn't be in the
    report
    """
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='model_year_report_makes',
        on_delete=models.PROTECT
    )
    make = models.CharField(
        blank=False,
        db_comment="The make of vehicle"
                   "eg Toyota, Honda, Mitsubishi",
        null=False,
        max_length=250
    )
    from_gov = models.BooleanField(
        default=False,
        db_comment="Flag. True if this edit came from a government user."
    )
    display = models.BooleanField(
        default=True,
        db_comment="field to determine if we should display this info"
    )

    class Meta:
        db_table = 'model_year_report_make'

    db_table_comment = "Makes that are involved for the model year report."

"""
ICBC Vehicle Model
"""
from django.db import models

from auditable.models import Auditable


class IcbcVehicle(Auditable):
    "All vehicle models that have been added from icbc registration"
    "spreadsheet."
    make = models.CharField(
        blank=False,
        db_comment="The make of vehicle"
                   "eg Toyota, Honda, Mitsubishi",
        null=False,
        max_length=250,
        db_index=True
    )
    model_name = models.CharField(
        blank=False,
        db_comment="Model and trim of vehicle",
        max_length=250,
        null=False,
        db_index=True
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False,
        db_index=True
    )

    class Meta:
        db_table = 'icbc_vehicle'
        unique_together = [[
            'make', 'model_name',
            'model_year'
        ]]
        index_together = [[
            'make', 'model_name',
            'model_year'
        ]]

    db_table_comment = "all vehicle models that have been added from icbc " \
                       "registration spreadsheet."

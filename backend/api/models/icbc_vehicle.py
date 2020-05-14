import django
from django.contrib.postgres.fields import ArrayField
from django.db import models

from auditable.models import Auditable
from enumfields import EnumField


class IcbcVehicle(Auditable):
    make = models.CharField(
        blank=False,
        db_comment="The make of vehicle"
                   "eg Toyota, Honda, Mitsubishi",
        unique=True,
        null=False,
        max_length=250
    )
    model_name = models.CharField(
        blank=False,
        db_comment="Model and trim of vehicle",
        max_length=250,
        null=False
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )

    class Meta:
        db_table = 'icbc_vehicle'
        unique_together = [[
            'make', 'model_name',
            'model_year'
        ]]
    db_table_comment = "all vehicle models that have been added from icbc registration spreadsheet."

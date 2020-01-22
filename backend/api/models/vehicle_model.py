from django.db import models

from auditable.models import Auditable
from .mixins.named import Named


class Model(Auditable, Named):
    class Meta:
        db_table = 'vehicle_model'

    make = models.ForeignKey(
        'Make',
        related_name='valid_models',
        on_delete=models.DO_NOTHING,
        null=False
    )

    db_table_comment = "Set of all vehicle models"

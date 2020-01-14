from django.db import models

from auditable.models import Auditable
from .mixins.named import Named


class Trim(Auditable, Named):
    class Meta:
        db_table = 'trim'

    model = models.ForeignKey(
        'Model',
        related_name='valid_trims',
        on_delete=models.DO_NOTHING,
        null=False
    )

    db_table_comment = "Set of all vehicle Trims"

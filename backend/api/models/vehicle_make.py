from django.db import models

from auditable.models import Auditable
from .mixins.named import Named


class Make(Auditable, Named):
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'vehicle_make'

    db_table_comment = "Brand of the vehicle" \
                       "e.g. Tesla, Honda"

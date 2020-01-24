from django.db import models

from api.models.mixins.effective_dates import EffectiveDates
from auditable.models import Auditable
from .mixins.named import Description


class VehicleClass(Auditable, Description, EffectiveDates):
    code = models.CharField(
        blank=False,
        db_comment="Vehicle Class Code (e.g. T, I, S, C, M, L)",
        max_length=3,
        null=False,
        primary_key=True
    )

    class Meta:
        db_table = 'vehicle_class'

    db_table_comment = "Vehicle Class (Body/Weight class)" \
                       "e.g. T - Two-seater" \
                       "I - Minicompact"

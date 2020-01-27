from django.db import models

from api.models.mixins.effective_dates import EffectiveDates
from auditable.models import Auditable
from .mixins.named import Description


class VehicleClass(Auditable, Description, EffectiveDates):
    vehicle_class_code = models.CharField(
        blank=False,
        db_comment="Vehicle Class Code (e.g. T, I, S, C, M, L)",
        max_length=3,
        null=False,
        unique=True
    )

    class Meta:
        db_table = 'vehicle_class_code'

    db_table_comment = "Vehicle Class (Body/Weight class) as defined in " \
                       "NRCAN" \
                       "e.g. T - Two-seater" \
                       "I - Minicompact"

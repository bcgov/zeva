from django.db import models

from api.models.mixins.effective_dates import EffectiveDates
from auditable.models import Auditable
from .mixins.named import Description


class ZevType(Auditable, Description, EffectiveDates):
    vehicle_zev_code = models.CharField(
        blank=False,
        db_comment="Zev type (e.g. BEV, FCEV, PHEV)",
        max_length=4,
        null=False,
        unique=True
    )

    class Meta:
        db_table = 'vehicle_zev_type'

    db_table_comment = \
        "ZEV type of the vehicle" \
        "e.g." \
        "BEV - Battery Electric Vehicle" \
        "FCEV - Hydrogen Fuel Cell Electric Vehicle"\
        "PHEV - Plug-in Hybrid Electric Vehicle"

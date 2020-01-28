from django.db import models

from api.models.mixins.effective_dates import EffectiveDates
from auditable.models import Auditable
from .mixins.named import Description


class FuelType(Auditable, Description, EffectiveDates):
    vehicle_fuel_code = models.CharField(
        blank=False,
        db_comment="Fuel type (e.g. B, BX, BZ)",
        max_length=3,
        null=False,
        unique=True
    )

    class Meta:
        db_table = 'vehicle_fuel_type'

    db_table_comment = "Fuel type of the vehicle as defined in NRCAN" \
                       "e.g. B - Electricity" \
                       "BX - Electricity/Regular Gasoline" \
                       "BZ - Electricity/Premium Gasoline"

from django.db import models

from api.models.mixins.effective_dates import EffectiveDates
from auditable.models import Auditable
from .mixins.named import Named


class FuelType(Auditable, Named, EffectiveDates):
    fuel_type = models.CharField(
        blank=False,
        db_comment="Fuel type (e.g. B, BX, BZ)",
        max_length=3,
        null=False,
        primary_key=True
    )

    class Meta:
        db_table = 'vehicle_fuel_type'

    db_table_comment = "Fuel type of the vehicle" \
                       "e.g. B - Electricity" \
                       "BX - Electricity/Regular Gasoline" \
                       "BZ - Electricity/Premium Gasoline"

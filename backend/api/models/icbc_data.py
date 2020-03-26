from api.models.vehicle import Vehicle
from auditable.models import Auditable
from django.db import models
from enumfields import EnumField


class IcbcData(Auditable):

    vehicle = models.ForeignKey(
        'Vehicle',
        related_name=None,
        on_delete=models.CASCADE
    )

    vin = models.CharField(blank=True,
                           null=True,
                           max_length=20,
                           db_comment="A Vehicle Identification Number, a standard 17-character identifier "
                                      " used in the automative industry to identify origin, colour, style, serial"
                                      " number, and other attributes (encoding is manufacturer-specific)")


    class Meta:
        db_table = "icbc_data"

    db_table_comment = 'Hold all relevant data from what is provided by ICBC'

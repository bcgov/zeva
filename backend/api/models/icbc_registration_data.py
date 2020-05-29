from api.models.icbc_vehicle import IcbcVehicle
from api.models.icbc_upload_date import IcbcUploadDate
from auditable.models import Auditable
from django.db import models
from enumfields import EnumField


class IcbcRegistrationData(Auditable):

    icbc_vehicle = models.ForeignKey(
        'IcbcVehicle',
        related_name=None,
        on_delete=models.CASCADE
    )

    vin = models.CharField(
        blank=False,
        null=False,
        unique=True,
        max_length=20,
        db_comment="A Vehicle Identification Number, a standard 17-character "
                   "identifier  used in the automative industry to identify "
                   "origin, colour, style, serial number, and other "
                   "attributes (encoding is manufacturer-specific)"
    )

    icbc_upload_date = models.ForeignKey(
        'IcbcUploadDate',
        related_name=None,
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = "icbc_registration_data"

    db_table_comment = "Contains records of BC vehicle registrations, as " \
                       "provided by ICBC. This data is typically provided/" \
                       "loaded quarterly and is used to verify a supplier’s " \
                       "submission for ZEV sales credits."

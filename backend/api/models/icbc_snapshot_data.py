from auditable.models import Auditable
from django.db import models


class IcbcSnapshotData(Auditable):
    submission = models.ForeignKey(
        'SalesSubmission',
        related_name='icbc_snapshot',
        null=False,
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
                   "attributes (encoding is manufacturer-specific)",
        db_index=True
    )
    make = models.CharField(
        blank=False,
        db_comment="The make of vehicle"
                   "eg Toyota, Honda, Mitsubishi",
        null=False,
        max_length=250,
        db_index=True
    )
    model_name = models.CharField(
        blank=False,
        db_comment="Model and trim of vehicle",
        max_length=250,
        null=False,
        db_index=True
    )
    model_year = models.CharField(
        blank=False,
        db_comment="Model Year of the vehicle that's in the ICBC data",
        null=False,
        max_length=250
    )
    upload_date = models.DateField(
        blank=False,
        db_comment="Upload date of the ICBC data",
        null=False,
        auto_now=False
    )

    class Meta:
        db_table = "icbc_snapshot_data"

    db_table_comment = \
        "Used as a reference for the record of sales. This is so we know " \
        "what the value was when the row was validated."

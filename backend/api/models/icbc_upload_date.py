from django.db import models
from auditable.models import Auditable


class IcbcUploadDate(Auditable):
    upload_date = models.DateField(
        blank=False,
        db_comment="the date the icbc data is current to",
        null=False,
        auto_now=False)
    filename = models.CharField(
        blank=True,
        max_length=500,
        null=True,
        db_comment="Filename of the uploaded data"
    )

    class Meta:
        db_table = 'icbc_upload_date'
    db_table_comment = "contains a record for each time that the icbc file is \
        uploaded, with the date current to as specified by the user"

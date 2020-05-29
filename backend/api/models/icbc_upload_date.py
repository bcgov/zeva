import django
from django.db import models
from auditable.models import Auditable

class IcbcUploadDate(Auditable):
    upload_date = models.DateField(
        blank=False,
        db_comment="the date the file is uploaded",
        null=False,
        auto_now=True)

    class Meta:
        db_table = 'icbc_upload_date'
    db_table_comment = "contains a record for each date that the icbc file is uploaded"

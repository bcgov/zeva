from django.db import models
from auditable.models import Auditable
from api.models.icbc_upload_date import IcbcUploadDate


class IcbcUploadProgress(Auditable):
    """
    Tracks the progress of ICBC data uploads.
    """
    upload = models.OneToOneField(
        IcbcUploadDate,
        on_delete=models.CASCADE,
        related_name='progress',
        db_column='upload_id'
    )
    progress = models.IntegerField(
        default=0
    )
    status_text = models.CharField(
        max_length=255,
        default='Starting...'
    )
    current_page = models.IntegerField(
        default=0
    )
    total_pages = models.IntegerField(
        default=0
    )
    complete = models.BooleanField(
        default=False
    )
    error = models.TextField(
        null=True,
        blank=True
    )
    results = models.JSONField(
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'icbc_upload_progress'

    def __str__(self):
        return f"Upload {self.upload.id}: {self.progress}% - {self.status_text}"

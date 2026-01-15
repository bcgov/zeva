from django.db import models


class IcbcUploadProgress(models.Model):
    """
    Tracks the progress of ICBC data uploads.
    """
    upload_id = models.CharField(
        max_length=36,
        unique=True,
        db_index=True
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
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = 'icbc_upload_progress'
        ordering = ['-created_at']

    def __str__(self):
        return f"Upload {self.upload_id}: {self.progress}% - {self.status_text}"

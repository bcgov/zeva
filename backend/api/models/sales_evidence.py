from django.db import models
from auditable.models import Auditable


class SalesEvidence(Auditable):
    """
    Attachment information for the sale submission.
    """
    submission = models.ForeignKey(
        'SalesSubmission',
        null=False,
        related_name='sales_evidence',
        on_delete=models.PROTECT
    )
    filename = models.CharField(
        max_length=260,
        db_comment="Filename from when it was in the user's system."
    )
    minio_object_name = models.CharField(
        blank=False,
        max_length=32,
        null=False,
        db_comment="Object name in minio (UUID as a 32 hexadecimal string)."
    )
    size = models.BigIntegerField(
        default=0,
        null=False,
        db_comment="Size of the file in bytes."
    )
    mime_type = models.CharField(
        blank=True,
        max_length=255,
        null=True,
        db_comment="Mime type information of the file. "
                   "(eg. application/pdf, image/gif, image/png, etc)"
    )
    is_removed = models.BooleanField(
        default=False,
        db_comment="Whether it was marked as deleted"
    )

    class Meta:
        db_table = 'sales_submission_evidence'

    db_table_comment = "Attachment information for the sale submission." \
                       "Contains information such as mime type, file size, " \
                       "and minio URL."

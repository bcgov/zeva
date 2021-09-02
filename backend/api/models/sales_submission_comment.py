"""
Sales Submission Comment Model
"""
from django.db import models

from auditable.models import Auditable


class SalesSubmissionComment(Auditable):
    """
    Contains comments made about the sales submission between
    director and analyst and from analyst to supplier
    """
    sales_submission = models.ForeignKey(
        'SalesSubmission',
        related_name='sales_submission_comments',
        null=False,
        on_delete=models.PROTECT
    )
    comment = models.CharField(
        max_length=4000,
        blank=True,
        null=True,
        db_column='sales_submission_comment',
        db_comment="Comment left by director/analyst about sale"
    )
    to_govt = models.BooleanField(
        default=False,
        db_comment="determines if comment is meant for government or supplier"
    )

    class Meta:
        db_table = 'sales_submission_comment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains comments made about the sales submission"\
            "between director and analyst and from analyst to supplier"

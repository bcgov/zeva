from django.db import models

from auditable.models import Auditable


class SalesSubmissionContent(Auditable):
    submission = models.ForeignKey(
        'SalesSubmission',
        related_name='+',
        null=False,
        on_delete=models.CASCADE
    )
    xls_make = models.CharField(
        blank=True,
        null=True,
        max_length=255,
        db_comment="Raw value of the Make from the spreadsheet"
    )
    xls_model = models.CharField(
        blank=True,
        null=True,
        max_length=255,
        db_comment="Raw value of the Vehicle Model from the spreadsheet"
    )
    xls_model_year = models.CharField(
        blank=True,
        null=True,
        max_length=255,
        db_comment="Raw value of the Model Year from the spreadsheet"
    )
    xls_sale_date = models.CharField(
        blank=True,
        null=True,
        max_length=255,
        db_comment="Raw value of the Sales Date from the spreadsheet"
    )
    xls_vin = models.CharField(
        blank=True,
        null=True,
        max_length=255,
        db_comment="Raw value of the VIN from the spreadsheet"
    )

    class Meta:
        db_table = "sale_submission_content"
        ordering = ['id']

    db_table_comment = "Holds the raw records for sale submission. " \
                       "This is so that we can look back into the  " \
                       "validation errors (if there are any) and " \
                       "show it to the users."

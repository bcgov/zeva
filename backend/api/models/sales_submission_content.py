from django.db import models

from auditable.models import Auditable
from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.vehicle import Vehicle


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
    xls_date_type = models.PositiveSmallIntegerField(
        default=3,
        db_comment="Date Type: 1: XL_CELL_TEXT, 3: XL_CELL_DATE"
    )
    xls_date_mode = models.PositiveSmallIntegerField(
        default=1,
        db_comment="XLS date mode: 0: 1900-based, 1: 1904-based (only applies "
                   "to XL_CELL_DATE)"
    )
    xls_vin = models.CharField(
        blank=True,
        null=True,
        max_length=255,
        db_comment="Raw value of the VIN from the spreadsheet"
    )

    @property
    def vehicle(self):
        try:
            model_year = float(self.xls_model_year)
        except ValueError:
            return None

        return Vehicle.objects.filter(
            make=self.xls_make,
            model_name=self.xls_model,
            model_year__name=int(model_year),
        ).first()

    @property
    def icbc_verification(self):
        return IcbcRegistrationData.objects.filter(
            vin__iexact=self.xls_vin
        ).first()

    @property
    def is_duplicate(self):
        contains_duplicate = SalesSubmissionContent.objects.filter(
            submission_id=self.submission_id,
            xls_vin=self.xls_vin
        ).exclude(
            id=self.id
        ).first()

        if contains_duplicate:
            return True

        return False

    @property
    def is_already_awarded(self):
        has_been_awarded = IcbcRegistrationData.objects.filter(
            vin=self.xls_vin
        ).first()

        if has_been_awarded:
            return True

        return False

    class Meta:
        db_table = "sales_submission_content"
        ordering = ['id']

    db_table_comment = "Holds the raw records for sale submission. " \
                       "This is so that we can look back into the  " \
                       "validation errors (if there are any) and " \
                       "show it to the users."

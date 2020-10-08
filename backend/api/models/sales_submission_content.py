from xlrd import xldate, XL_CELL_TEXT, XL_CELL_DATE, XLDateError
from dateutil.parser import parse
from django.db import models

from auditable.models import Auditable
from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.vehicle import Vehicle
from api.models.record_of_sale import RecordOfSale
from api.models.icbc_upload_date import IcbcUploadDate
from api.models.vehicle_statuses import VehicleDefinitionStatuses


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
            make__iexact=self.xls_make,
            model_name=self.xls_model,
            model_year__name=int(model_year),
            validation_status=VehicleDefinitionStatuses.VALIDATED,
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
        has_been_awarded = RecordOfSale.objects.exclude(
            submission_id=self.submission_id
        ).filter(
            vin=self.xls_vin
        ).first()

        if has_been_awarded:
            return True

        return False

    @property
    def sales_date(self):
        try:
            date_float = float(self.xls_sale_date)
        except ValueError:
            return None

        if self.xls_date_type == XL_CELL_DATE:
            try:
                return xldate.xldate_as_datetime(
                    date_float,
                    self.xls_date_mode
                )
            except XLDateError:
                return None
        elif self.xls_date_type == XL_CELL_TEXT:
            try:
                return parse(str(date_float), fuzzy=True)
            except ValueError:
                return None

        return None

    @property
    def record_of_sale(self):
        return RecordOfSale.objects.filter(
            submission_id=self.submission_id,
            vehicle=self.vehicle,
            vin=self.xls_vin
        ).first()

    @property
    def warnings(self):
        warnings = []

        if self.vehicle is None:
            warnings.append('INVALID_MODEL')

        if self.record_of_sale is None:
            warnings.append('ROW_NOT_SELECTED')

        icbc_upload_date = IcbcUploadDate.objects.order_by(
            '-upload_date'
        ).first()

        if self.sales_date is None:
            warnings.append('INVALID_DATE')
        elif icbc_upload_date is not None:
            date_diff = abs(
                self.sales_date.year - icbc_upload_date.upload_date.year
            ) * 12 + abs(
                self.sales_date.month - icbc_upload_date.upload_date.month
            )

            if date_diff > 3:
                warnings.append('EXPIRED_REGISTRATION_DATE')

        if self.is_already_awarded:
            warnings.append('VIN_ALREADY_AWARDED')

        if self.is_duplicate:
            warnings.append('DUPLICATE_VIN')

        if self.icbc_verification is None:
            warnings.append('NO_ICBC_MATCH')
        elif self.vehicle is not None:
            if self.icbc_verification.icbc_vehicle.model_year != \
                    self.vehicle.model_year:
                warnings.append('MODEL_MISMATCHED')

        return warnings

    class Meta:
        db_table = "sales_submission_content"
        ordering = ['id']

    db_table_comment = "Holds the raw records for sale submission. " \
                       "This is so that we can look back into the  " \
                       "validation errors (if there are any) and " \
                       "show it to the users."

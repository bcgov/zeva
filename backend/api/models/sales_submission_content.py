import datetime
from xlrd import xldate, XL_CELL_TEXT, XL_CELL_DATE, XLDateError
from dateutil.parser import parse
from django.db import models

from auditable.models import Auditable
from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.vehicle import Vehicle
from api.models.record_of_sale import RecordOfSale
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_statuses import ModelYearReportStatuses


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
        db_comment="Raw value of the Make from the spreadsheet",
        db_index=True
    )
    xls_model = models.CharField(
        blank=True,
        null=True,
        max_length=255,
        db_comment="Raw value of the Vehicle Model from the spreadsheet",
        db_index=True
    )
    xls_model_year = models.CharField(
        blank=True,
        null=True,
        max_length=255,
        db_comment="Raw value of the Model Year from the spreadsheet",
        db_index=True
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
        db_comment="Raw value of the VIN from the spreadsheet",
        db_index=True
    )
    reason = models.CharField(
        blank=True,
        null=True,
        max_length=255,
        db_comment="Reason for overriding the initial assessment"
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
            organization_id=self.submission.organization_id,
            validation_status=VehicleDefinitionStatuses.VALIDATED,
        ).exclude(
            create_timestamp__gte=self.update_timestamp
        ).first()

    @property
    def icbc_verification(self):
        q = 'select * from icbc_registration_data join icbc_upload_date on \
            icbc_upload_date.id = icbc_upload_date_id where \
                vin=\'{}\' and upload_date < \'{}\' limit 1'.format(
                    self.xls_vin, self.update_timestamp)
        registration = IcbcRegistrationData.objects.raw(q)
        if registration:
            return registration[0]
        else:
            return None

    @property
    def is_duplicate(self):
        contains_duplicate = SalesSubmissionContent.objects.filter(
            submission_id=self.submission_id,
            xls_vin=self.xls_vin
        ).exclude(
            id=self.id
        ).exclude(
            create_timestamp__gte=self.update_timestamp
        ).first()

        if contains_duplicate:
            return True

        return False

    @property
    def is_already_awarded(self):
        has_been_awarded = RecordOfSale.objects.exclude(
            submission__validation_status='REJECTED'
        ).exclude(
            submission_id=self.submission_id
        ).filter(
            vin=self.xls_vin
        ).exclude(
            create_timestamp__gte=self.update_timestamp
        ).first()

        if has_been_awarded:
            return True

        return False

    @property
    def sales_date(self):
        if self.xls_date_type == XL_CELL_DATE:
            try:
                date_float = float(self.xls_sale_date)
            except ValueError:
                return None

            try:
                return xldate.xldate_as_datetime(
                    date_float,
                    self.xls_date_mode
                )
            except XLDateError:
                return None

        elif self.xls_date_type == XL_CELL_TEXT:
            try:
                return parse(str(self.xls_sale_date), fuzzy=True)
            except ValueError:
                return None

        return None

    @property
    def record_of_sale(self):
        return RecordOfSale.objects.filter(
            submission_id=self.submission_id,
            vehicle=self.vehicle,
            vin=self.xls_vin
        ).exclude(
            create_timestamp__gte=self.update_timestamp
        ).first()

    @property
    def is_wrong_model_year(self):
        myr_reports = ModelYearReport.objects.filter(
            organization_id = self.submission.organization
        )

        for report in myr_reports:
            if report.validation_status not in [ModelYearReportStatuses.ASSESSED, ModelYearReportStatuses.DRAFT] and str(report.model_year.name) != str(self.xls_model_year).split('.')[0]:
                return True
        
        return False

    @property
    def warnings(self):
        warnings = []

        if self.vehicle is None:
            warnings.append('INVALID_MODEL')

        if self.record_of_sale is None:
            warnings.append('ROW_NOT_SELECTED')

        if self.sales_date is None:
            warnings.append('INVALID_DATE')
        elif self.sales_date < datetime.datetime(2018, 1, 2):
            warnings.append('EXPIRED_REGISTRATION_DATE')

        if self.is_already_awarded:
            warnings.append('VIN_ALREADY_AWARDED')

        if self.is_duplicate:
            warnings.append('DUPLICATE_VIN')

        icbc_verification = self.icbc_verification
        if icbc_verification is None:
            warnings.append('NO_ICBC_MATCH')
        elif self.vehicle is not None:
            if icbc_verification.icbc_vehicle.model_year != \
                    self.vehicle.model_year:
                warnings.append('MODEL_YEAR_MISMATCHED')

            if icbc_verification.icbc_vehicle.make != \
                    self.vehicle.make:
                warnings.append('MAKE_MISMATCHED')

        if self.is_wrong_model_year:
            warnings.append('WRONG_MODEL_YEAR')

        return warnings

    @property
    def valid_sales_date(self):
        if self.sales_date is None:
            return False
        elif self.sales_date < datetime.datetime(2018, 1, 2):
            return False

        return True

    class Meta:
        db_table = "sales_submission_content"
        ordering = ['id']

    db_table_comment = "Holds the raw records for sale submission. " \
                       "This is so that we can look back into the  " \
                       "validation errors (if there are any) and " \
                       "show it to the users."

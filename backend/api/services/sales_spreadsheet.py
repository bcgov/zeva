import base64
import binascii
import logging
from datetime import datetime
import pickle
from pickle import PickleError
import magic

from dateutil.parser import parse
from django.core.exceptions import ValidationError
from django.db.models import Subquery

import xlrd
import xlwt
from xlrd import XLRDError, XLDateError

from api.models.model_year import ModelYear
from api.models.organization import Organization
from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_history import SalesSubmissionHistory
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.vehicle import Vehicle

logger = logging.getLogger('zeva.sales_spreadsheet')

MAGIC = [0x00, 0xd3, 0xc0, 0xde]
OUTPUT_ROWS = 50
MAX_READ_ROWS = 50000

BOLD = xlwt.easyxf('font: name Times New Roman, bold on;')
LOCKED = xlwt.easyxf('protection: cell_locked true;')
EDITABLE = xlwt.easyxf('protection: cell_locked false;')
EDITABLE_DATE = xlwt.easyxf(
    'protection: cell_locked false;', num_format_str='yyyy/mm/dd'
)


def add_vehicle_rows(worksheet, row, vehicles, style):
    current_vehicle_col_width = 13

    for vehicle in vehicles:
        row += 1
        worksheet.write(row, 0, int(vehicle.model_year.name), style=style)
        worksheet.write(row, 1, vehicle.make, style=style)
        worksheet.write(row, 2, vehicle.model_name, style=style)

        if len(vehicle.model_name) > current_vehicle_col_width:
            current_vehicle_col_width = len(vehicle.model_name)

    vehicle_model_col = worksheet.col(2)
    vehicle_model_col.width = 256 * current_vehicle_col_width


def add_instructions_sheet(**kwargs):
    sheet_name = 'Instructions'

    workbook = kwargs.pop('workbook')
    descriptor = kwargs.pop('descriptor')
    organization = kwargs.pop('organization')
    vehicles = kwargs.pop('vehicles')

    worksheet = workbook.add_sheet(sheet_name)
    worksheet.protect = True
    descriptor['sheets'].append({
        'index': 0,
        'name': sheet_name
    })

    row = 0
    worksheet.write(row, 0, 'Recording sales for {organization}'.format(
        organization=organization.name
    ), style=BOLD)

    row += 1
    worksheet.write(
        row, 0,
        'Record each individual sale in the next sheet (ZEV Sales).'
        'Vehicle Model, VIN and Retail Sales Date fields are required.'
    )
    row += 2
    worksheet.write(
        row, 0,
        'Retail Sales Date in YYYY-MM-DD format, '
        'eg. 2020-07-20'
    )
    row += 2
    worksheet.write(
        row, 0,
        'A maximum of {} entries per sheet will be read. If you need '
        'more entries, use multiple submissions'.format(MAX_READ_ROWS)
    )

    row += 2
    worksheet.write(
        row, 0,
        'Please input the Sales date in YYYY-MM-DD format.'
    )

    row += 2
    worksheet.write(
        row, 0,
        'Only the following models are currently valid:'
    )

    row += 1
    worksheet.write(row, 0, 'Model Year', style=BOLD)
    worksheet.write(row, 1, 'Make', style=BOLD)
    worksheet.write(row, 2, 'Vehicle Model', style=BOLD)
    add_vehicle_rows(worksheet, row, vehicles, LOCKED)


def add_sales_sheet(**kwargs):
    sheet_name = 'ZEV Sales'

    workbook = kwargs.pop('workbook')
    descriptor = kwargs.pop('descriptor')
    vehicles = kwargs.pop('vehicles')

    worksheet = workbook.add_sheet(sheet_name)
    worksheet.protect = False
    descriptor['sheets'].append({
        'index': 1,
        'name': sheet_name
    })

    row = 0

    worksheet.write(row, 0, 'Model Year', style=BOLD)
    worksheet.write(row, 1, 'Make', style=BOLD)
    worksheet.write(row, 2, 'Vehicle Model', style=BOLD)
    worksheet.write(row, 3, 'VIN', style=BOLD)
    worksheet.write(row, 4, 'Retail Sales Date (yyyy-mm-dd)', style=BOLD)

    add_vehicle_rows(worksheet, row, vehicles, EDITABLE)


def create_sales_spreadsheet(organization, stream):
    logger.info(f'Starting to build spreadsheet for {organization.name}')
    sheet_count = 0

    workbook = xlwt.Workbook('{} Sales Recording'.format(organization.name))
    workbook.protect = True

    descriptor = {
        'version': 2,
        'create_time': datetime.utcnow().timestamp(),
        'organization_id': organization.id,
        'sheets': []
    }

    date_today = datetime.today()
    start_year = datetime(year=date_today.year-2, month=1, day=1)

    model_years = ModelYear.objects.filter(effective_date__gte=start_year)

    vehicles = Vehicle.objects.filter(
        model_year__in=model_years,
        organization_id=organization.id,
        validation_status='VALIDATED'
    )

    add_instructions_sheet(
        workbook=workbook,
        descriptor=descriptor,
        organization=organization,
        vehicles=vehicles
    )

    add_sales_sheet(
        workbook=workbook,
        descriptor=descriptor,
        vehicles=vehicles
    )

    descriptor_bytes = [0x00, 0xd3, 0xc0, 0xde]
    descriptor_bytes.extend(pickle.dumps(descriptor))
    encoded_descriptor = base64.standard_b64encode(bytes(descriptor_bytes))

    worksheet = workbook.add_sheet('ZEVA Internal Use')
    worksheet.write(0, 0, encoded_descriptor.decode('ascii'), style=LOCKED)

    logger.info(
        f'Done building spreadsheet. {sheet_count} sheets created'
    )
    logger.info(f'Descriptor {descriptor}')
    logger.info(f'Encoded {encoded_descriptor.decode("ascii")}')

    workbook.save(stream)


def ingest_sales_spreadsheet(
        data, user=None, skip_authorization=False,
        submission_id=None, filename=None
):
    workbook = xlrd.open_workbook(file_contents=data)

    if skip_authorization is True:
        workbook = xlrd.open_workbook(file_contents=data)
        organization = get_organization(workbook)
        username = 'SYSTEM'
    else:
        organization = user.organization
        username = user.username

    # Enable this when we finally get our permissions correct
    # if not skip_authorization and not user.has_perm('CREATE_SALES'):
    #     raise PermissionDenied(
    #         'You do not have permissions to upload new sales'
    #     )

    if not submission_id:
        submission = SalesSubmission.objects.create(
            create_user=username,
            update_user=username,
            organization=organization,
            submission_sequence=SalesSubmission.next_sequence(
                organization, datetime.now()
            ),
            filename=filename
        )
        submissionHistory = SalesSubmissionHistory.objects.create(
                submission=submission,
                validation_status='DRAFT',
                update_user=username,
                create_user=username,
            )
        submissionHistory.save()
    else:
        submission = SalesSubmission.objects.get(
            id=submission_id,
            organization_id=organization.id
        )

        submission.filename = filename
        submission.save()


        # Enable this when we finally get our permissions correct
        # if not user.has_perm('EDIT_SALES'):
        #     raise PermissionDenied(
        #         'You do not have permission to edit the sales submission'
        #     )

        SalesSubmissionContent.objects.filter(
            submission_id=submission_id
        ).delete()

    sheet = workbook.sheet_by_name('ZEV Sales')

    start_row = 1
    row = start_row

    while row < min((MAX_READ_ROWS + start_row), sheet.nrows):
        row_contents = sheet.row(row)
        store_raw_value(submission, row_contents, workbook.datemode)

        row += 1

    return {
        'id': submission.id,
        'submissionId': datetime.now().strftime("%Y-%m-%d")
    }


def get_organization(workbook):
    try:
        metadata_sheet = workbook.sheet_by_name('ZEVA Internal Use')
        row = metadata_sheet.row(0)
        encoded_descriptor = row[0].value
        descriptor_bytes = base64.standard_b64decode(encoded_descriptor)
        magic_verification = descriptor_bytes[0:4]

        if bytes(magic_verification) != bytes(MAGIC):
            raise ValidationError(
                'ZEVA Internal Use sheet has been modified. '
                'Please download the template again and try again.'
            )

        descriptor = pickle.loads(descriptor_bytes[4:])
    except (XLRDError, IndexError, binascii.Error, PickleError) as error:
        logger.critical(error)
        raise ValidationError(
            'ZEVA Internal Use sheet is missing. '
            'Please download the template again and try again.'
        )

    organization = Organization.objects.filter(id=descriptor['organization_id']).first()

    return organization


def validate_xls_file(file):
    mime = magic.Magic(mime=True)
    mimetype = mime.from_file(file.temporary_file_path())

    if mimetype != "application/vnd.ms-excel":
        raise ValidationError(
            'File must be an excel spreadsheet'
        )

    return True


def validate_spreadsheet(data, user_organization=None, skip_authorization=False):
    try:
        workbook = xlrd.open_workbook(file_contents=data)
    except XLRDError:
        raise ValidationError(
            'Invalid File Type. '
            'Please download the template again and try again.'
        )

    organization = get_organization(workbook)

    if organization is None or (
            not skip_authorization and
            organization != user_organization
    ):
        raise ValidationError(
            'Spreadsheet is designated for another organization. '
            'Please download the template again and try again.'
        )

    try:
        sheet = workbook.sheet_by_name('ZEV Sales')
    except XLRDError:
        raise ValidationError(
            'Spreadsheet is missing ZEV Sales sheet.'
            'Please download the template again and try again.'
        )

    start_row = 1
    row = start_row

    while row < min((MAX_READ_ROWS + start_row), sheet.nrows):
        row_contents = sheet.row(row)
        model_year = str(row_contents[0].value).strip()
        make = str(row_contents[1].value).strip()
        model_name = str(row_contents[2].value).strip()
        vin = str(row_contents[3].value)
        date = str(row_contents[4].value).strip()

        row_contains_content = False

        if len(model_year) > 0 or len(make) > 0 or len(model_name) > 0 or \
                len(date) > 0:
            row_contains_content = True

        if row_contains_content and len(vin) < 1:
            raise ValidationError(
                'Spreadsheet contains a row with missing VIN. Please clear '
                'the row and try again.'
            )
        row += 1

    return True


def get_date(date, date_type, datemode):
    try:
        date_float = float(date)
    except ValueError:
        return None

    if date_type == xlrd.XL_CELL_DATE:
        try:
            return xlrd.xldate.xldate_as_datetime(
                date_float,
                datemode
            )
        except XLDateError:
            return None
    elif date_type == xlrd.XL_CELL_TEXT:
        try:
            return parse(str(date_float), fuzzy=True)
        except ValueError:
            return None

    return None


def store_raw_value(submission, row_contents, date_mode):
    if row_contents[3].value != '':
        SalesSubmissionContent.objects.create(
            submission=submission,
            xls_model_year=str(row_contents[0].value).strip(),
            xls_make=str(row_contents[1].value).strip(),
            xls_model=str(row_contents[2].value).strip(),
            xls_vin=str(row_contents[3].value).strip(),
            xls_sale_date=str(row_contents[4].value).strip(),
            xls_date_type=row_contents[4].ctype,
            xls_date_mode=date_mode
        )

    return None


def create_errors_spreadsheet(submission_id, organization_id, stream):
    sales_submission = SalesSubmission.objects.get(
        id=submission_id,
        organization_id=organization_id
    )

    organization = sales_submission.organization

    workbook = xlwt.Workbook('{} Errors'.format(organization.name))
    workbook.protect = True

    descriptor = {
        'version': 2,
        'create_time': datetime.utcnow().timestamp(),
        'organization_id': organization.id,
        'sheets': []
    }

    sheet_name = 'ZEV Sales Errors'
    worksheet = workbook.add_sheet(sheet_name)
    worksheet.protect = True
    descriptor['sheets'].append({
        'index': 1,
        'name': sheet_name
    })

    row = 0

    worksheet.write(row, 0, 'Model Year', style=BOLD)
    worksheet.write(row, 1, 'Make', style=BOLD)
    worksheet.write(row, 2, 'Vehicle Model', style=BOLD)
    worksheet.write(row, 3, 'VIN', style=BOLD)
    worksheet.write(row, 4, 'Sales Date', style=BOLD)
    worksheet.write(row, 5, 'Error', style=BOLD)

    record_of_sales_vin = Subquery(RecordOfSale.objects.filter(
        submission_id=submission_id
    ).values_list('vin', flat=True))

    submission_content = SalesSubmissionContent.objects.filter(
        submission_id=submission_id,
        submission__organization_id=organization.id
    ).exclude(
        xls_vin__in=record_of_sales_vin
    )

    current_vehicle_col_width = 13

    for content in submission_content:
        if len(content.warnings) == 0:
            next()

        row += 1

        error = ''

        if 'DUPLICATE_VIN' in content.warnings:
            error += 'Duplicate VIN; '

        if 'EXPIRED_REGISTRATION_DATE' in content.warnings:
            error += 'Sale prior to 2 Jan 2018; '

        if 'INVALID_DATE' in content.warnings:
            error += 'Invalid Date Format. Please use YYYY-MM-DD ' \
                        'format; '

        if 'INVALID_MODEL' in content.warnings:
            error += 'invalid make, model and year combination; '

        if 'MODEL_YEAR_MISMATCHED' in content.warnings:
            error += 'Model year does not match BC registration data; '

        if 'MAKE_MISMATCHED' in content.warnings:
            error += 'Make does not match BC registration data; '

        if 'NO_ICBC_MATCH' in content.warnings:
            error += 'VIN not registered in BC; '

        if 'VIN_ALREADY_AWARDED' in content.warnings:
            error += 'VIN already issued credit; '

        if 'ROW_NOT_SELECTED' in content.warnings and error == '':
            error += 'entry was rejected for validation; '

        date = get_date(
            content.xls_sale_date,
            content.xls_date_type,
            content.xls_date_mode
        )

        if content.xls_model_year is not None:
            worksheet.write(
                row, 0, int(float(content.xls_model_year)), style=LOCKED
            )
        worksheet.write(row, 1, content.xls_make, style=LOCKED)
        worksheet.write(row, 2, content.xls_model, style=LOCKED)
        worksheet.write(row, 3, content.xls_vin, style=LOCKED)
        if date is not None:
            worksheet.write(row, 4, date.strftime('%Y-%m-%d'), style=LOCKED)
        worksheet.write(row, 5, error, style=LOCKED)

        if len(content.xls_model) > current_vehicle_col_width:
            current_vehicle_col_width = len(content.xls_model)

    vehicle_model_col = worksheet.col(2)
    vehicle_model_col.width = 256 * current_vehicle_col_width

    workbook.save(stream)

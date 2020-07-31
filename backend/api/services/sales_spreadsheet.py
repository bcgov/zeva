import base64
import binascii
import logging
from datetime import datetime
import pickle
from pickle import PickleError
import magic

from dateutil.parser import parse
from django.core.exceptions import ValidationError

import xlrd
import xlwt
from xlrd import XLRDError, XLDateError

from api.models.model_year import ModelYear
from api.models.organization import Organization
from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
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
        'Retail Sales Date in yyyy-mm-dd format, '
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
        data, requesting_user=None, skip_authorization=False
):
    logger.info('Opening spreadsheet')

    if requesting_user is None and skip_authorization is False:
        raise Exception(
            'requesting_user is None and skip_authorization is disabled'
        )

    workbook = xlrd.open_workbook(file_contents=data)

    validation_problems = []
    entries = []

    try:
        metadata_sheet = workbook.sheet_by_name('ZEVA Internal Use')
        row = metadata_sheet.row(0)
        encoded_descriptor = row[0].value
        descriptor_bytes = base64.standard_b64decode(encoded_descriptor)
        magic_verification = descriptor_bytes[0:4]

        if bytes(magic_verification) == bytes(MAGIC):
            logger.info('Good Magic')
        else:
            validation_problems.append({'row': None, 'message': 'Bad Magic'})
            logger.critical(
                'Unable to parse. Validation problems: {validation_problems}'
            )
            return

        descriptor = pickle.loads(descriptor_bytes[4:])
        logger.info(f'Read descriptor: {descriptor}')
    except XLRDError:
        validation_problems.append({
            'row': None, 'message': 'No metadata sheet'
        })
        logger.critical(
            f'Unable to parse. Validation problems: {validation_problems}'
        )
        return
    except IndexError:
        validation_problems.append({
            'row': None, 'message': 'Expected values not in metadata sheet'
        })
        logger.critical(
            f'Unable to parse. Validation problems: {validation_problems}'
        )
        return
    except binascii.Error:
        validation_problems.append({
            'row': None, 'message': 'Base64 decode failed'
        })
        logger.critical(
            f'Unable to parse. Validation problems: {validation_problems}'
        )
        return
    except PickleError:
        validation_problems.append({
            'row': None, 'message': 'Descriptor unpickling error'
        })
        logger.critical(
            f'Unable to parse. Validation problems: {validation_problems}'
        )
        return

    org = Organization.objects.get(id=descriptor['organization_id'])

    if not skip_authorization and org != requesting_user.organization:
        validation_problems.append({
            'row': None,
            'message': 'Organization mismatch!'
        })
        logger.critical('Organization mismatch!')
        return

    submission = SalesSubmission.objects.create(
        create_user=requesting_user.username,
        update_user=requesting_user.username,
        organization=org,
        submission_sequence=SalesSubmission.next_sequence(org, datetime.now())
    )

    try:
        sheet = workbook.sheet_by_name('ZEV Sales')
    except XLRDError:
        logger.info('ZEV Sales Sheet missing')
        validation_problems.append({
            'row': None,
            'message': 'Expected to find a sheet called ZEV Sales.'
        })

    logger.info('Reading ZEV Sales')

    start_row = 1
    row = start_row

    while row < min((MAX_READ_ROWS + start_row), sheet.nrows):
        row_contents = sheet.row(row)
        model_year = int(row_contents[0].value)
        make = str(row_contents[1].value)
        model_name = str(row_contents[2].value)
        vin = str(row_contents[3].value)
        date_type = row_contents[4].ctype
        date = row_contents[4].value

        parsed_date = None

        row += 1  # so it matches the row in the spreadsheet

        if len(vin) <= 0:
            continue

        is_valid, error_message = validate_row(row_contents, workbook, org)

        if is_valid:
            parsed_date = get_date(date, date_type, workbook.datemode)

            vehicle = Vehicle.objects.filter(
                model_year__name=model_year,
                make=make,
                model_name=model_name,
                validation_status='VALIDATED'
            ).first()

            record_of_sale = RecordOfSale.objects.create(
                submission=submission,
                vehicle=vehicle,
                vin=vin,
                sale_date=parsed_date,
                reference_number=None
            )

            entries.append({
                'vin': vin,
                'vin_validation_status':
                record_of_sale.vin_validation_status.value,
                'sale_date': parsed_date,
                'id': record_of_sale.id,
                'credits': vehicle.get_credit_value(),
                'model': vehicle.model_name,
                'model_year': vehicle.model_year.name,
                'make': vehicle.make,
                'class':
                vehicle.vehicle_class_code.vehicle_class_code,
                'range': vehicle.range,
                'type':
                vehicle.vehicle_zev_type.vehicle_zev_code,
            })
            logger.info(f'Recorded sale {vin}')

        else:
            validation_problems.append({
                'row': row,
                'rowContents': {
                    'make': make,
                    'modelName': model_name,
                    'modelYear': model_year,
                    'saleDate': parsed_date,
                    'vin': vin,
                },
                'message': error_message
            })

    if len(validation_problems) > 0:
        logger.info(
            f'Noncritical validation errors encountered: {validation_problems}'
        )

    logger.info('Done processing spreadsheet')

    return {
        'id': submission.id,
        'submissionID': datetime.now().strftime("%Y-%m-%d"),
        'validationProblems': validation_problems,
        'entries': entries,
    }


def validate_spreadsheet(request):
    files = request.FILES.getlist('files')

    for file in files:
        mime = magic.Magic(mime=True)
        mimetype = mime.from_file(file.temporary_file_path())

        if mimetype != "application/vnd.ms-excel":
            raise ValidationError(
                'File must be an excel spreadsheet'
            )

    return True


def validate_row(row_contents, workbook, org):
    is_valid = True
    model_year = int(row_contents[0].value)
    make = str(row_contents[1].value)
    model_name = str(row_contents[2].value)
    vin = str(row_contents[3].value)
    date_type = row_contents[4].ctype
    date = row_contents[4].value
    validation_problems = []
    error_message = None
    parsed_date = None

    if len(vin) < 17:
        validation_problems.append(
            'VIN {} has incorrect length'.format(vin)
        )

    parsed_date = get_date(date, date_type, workbook.datemode)

    if parsed_date is None:
        validation_problems.append(
            'Invalid sales date. Please use YYYY-MM-DD.'
        )
    elif parsed_date < datetime(2018, 1, 2):
        validation_problems.append(
            'Sales date before January 2, 2018 are invalid'
        )

    if model_year < 2019:
        validation_problems.append(
            'Only model years 2019 and beyond are allowed'
        )

    if RecordOfSale.objects.filter(
            vin=vin, submission__organization=org
    ).exists():
        validation_problems.append(
            'VIN {} has previously been recorded'.format(vin)
        )

    vehicle = Vehicle.objects.filter(
        model_year__name=model_year,
        make=make,
        model_name=model_name,
        validation_status='VALIDATED'
    ).first()

    if vehicle is None:
        validation_problems.append(
            "{} doesn't match an approved vehicle model.".format(model_name)
        )

    if validation_problems:
        is_valid = False
        error_message = ', '.join(validation_problems)

    return is_valid, error_message


def get_date(date, date_type, datemode):
    if date_type == xlrd.XL_CELL_DATE:
        try:
            return xlrd.xldate.xldate_as_datetime(
                date,
                datemode
            )
        except XLDateError:
            return None
    elif date_type == xlrd.XL_CELL_TEXT:
        try:
            return parse(str(date), fuzzy=True)
        except ValueError:
            return None

    return None

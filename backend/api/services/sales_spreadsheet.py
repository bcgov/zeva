import base64
import binascii
import logging
import magic
import pickle
from datetime import datetime
from pickle import PickleError

from django.core.exceptions import ValidationError

import xlrd
import xlwt
from xlrd import XLRDError, XLDateError

from api.models.organization import Organization
from api.models.record_of_sale import RecordOfSale
from api.models.sales_submission import SalesSubmission
from api.models.vehicle import Vehicle
from api.models.vehicle_make_organization import VehicleMakeOrganization

logger = logging.getLogger('zeva.sales_spreadsheet')

MAGIC = [0x00, 0xd3, 0xc0, 0xde]
OUTPUT_ROWS = 50
MAX_READ_ROWS = 50000


def create_sales_spreadsheet(organization, model_year, stream):
    logger.info('Starting to build spreadsheet for {org}'.format(org=organization.name))
    sheet_count = 0

    bold = xlwt.easyxf('font: name Times New Roman, bold on;')
    locked = xlwt.easyxf("protection: cell_locked true;")
    editable = xlwt.easyxf("protection: cell_locked false;")
    editable_date = xlwt.easyxf("protection: cell_locked false;", num_format_str='yyyy/mm/dd')

    wb = xlwt.Workbook('{} Sales Recording'.format(organization.name))
    wb.protect = True

    descriptor = {
        'version': 2,
        'model_year': model_year.name,
        'create_time': datetime.utcnow().timestamp(),
        'organization_id': organization.id,
        'sheets': []
    }

    sheet_names = {}
    make_assoc = VehicleMakeOrganization.objects.filter(organization=organization)

    for ma in make_assoc:
        make = ma.vehicle_make
        logger.info('{org} supplies {name}'.format(org=organization.name,
                                                   name=make.name))

        vehicles = Vehicle.objects.filter(make=make, model_year=model_year)
        for veh in vehicles:
            logger.info('{make} has model {model}'.format(make=make.name,
                                                          model=veh.model_name))

            sheet_name = '{} - {}'.format(make.name, veh.model_name)
            if sheet_name not in sheet_names.keys():
                sheet_names[sheet_name] = 0

            sheet_names[sheet_name] += 1

            if sheet_names[sheet_name] > 1:
                sheet_name = '{} - {} - Alternate {}'.format(make.name, veh.model_name, sheet_names[sheet_name] - 1)

            ws = wb.add_sheet(sheet_name)
            ws.protect = True
            descriptor['sheets'].append({
                'index': sheet_count,
                'name': sheet_name,
                'vehicle_id': veh.id,
            })

            sheet_count += 1
            row = 0
            ws.write(row, 0, 'Recording sales for {year} {make} {model}'.format(year=veh.model_year.name,
                                                                                make=veh.make.name,
                                                                                model=veh.model_name), style=bold)
            row += 1

            ws.write(row, 0, 'Record each individual sale for this model in the spaces below. VIN and Sales Date '
                             'fields are required.')

            row += 2

            ws.write(row, 0, 'Reference Number', style=bold)
            ws.write(row, 1, 'VIN', style=bold)
            ws.write(row, 2, 'Sales Date', style=bold)

            row += 1

            while row < OUTPUT_ROWS:
                ref = 'Assigned'
                ws.write(row, 0, '{ref}'.format(ref=ref), style=locked)
                ws.write(row, 1, '', style=editable)
                ws.write(row, 2, None, style=editable_date)
                row += 1

            ws.write(row, 0, 'A maximum of {} entries per sheet will be read. If you need more entries,'
                             ' use multiple submissions'.format(MAX_READ_ROWS))

    descriptor_bytes = [0x00, 0xd3, 0xc0, 0xde]
    descriptor_bytes.extend(pickle.dumps(descriptor))
    encoded_descriptor = base64.standard_b64encode(bytes(descriptor_bytes))

    ws = wb.add_sheet('ZEVA Internal Use')
    ws.write(0, 0, encoded_descriptor.decode('ascii'), style=locked)

    logger.info('Done building spreadsheet. {} sheets created'.format(sheet_count))
    logger.info('Descriptor {}'.format(descriptor))
    logger.info('Encoded {}'.format(encoded_descriptor.decode('ascii')))

    wb.save(stream)


def ingest_sales_spreadsheet(data, requesting_user=None, skip_authorization=False):
    logger.info('Opening spreadsheet')

    if requesting_user is None and skip_authorization is False:
        raise Exception('requesting_user is None and skip_authorization is disabled')

    wb = xlrd.open_workbook(file_contents=data)

    validation_problems = []
    entries = []

    try:
        metadata_sheet = wb.sheet_by_name('ZEVA Internal Use')
        row = metadata_sheet.row(0)
        encoded_descriptor = row[0].value
        descriptor_bytes = base64.standard_b64decode(encoded_descriptor)
        magic_verification = descriptor_bytes[0:4]

        if bytes(magic_verification) == bytes(MAGIC):
            logger.info('Good Magic')
        else:
            validation_problems.append({'row': None, 'message': 'Bad Magic'})
            logger.critical('Unable to parse. Validation problems: {}'.format(validation_problems))
            return

        descriptor = pickle.loads(descriptor_bytes[4:])
        logger.info('Read descriptor: {}'.format(descriptor))

    except XLRDError:
        validation_problems.append({'row': None, 'message': 'No metadata sheet'})
        logger.critical('Unable to parse. Validation problems: {}'.format(validation_problems))
        return
    except IndexError:
        validation_problems.append({'row': None, 'message': 'Expected values not in metadata sheet'})
        logger.critical('Unable to parse. Validation problems: {}'.format(validation_problems))
        return
    except binascii.Error:
        validation_problems.append({'row': None, 'message': 'Base64 decode failed'})
        logger.critical('Unable to parse. Validation problems: {}'.format(validation_problems))
        return
    except PickleError:
        validation_problems.append({'row': None, 'message': 'Descriptor unpickling error'})
        logger.critical('Unable to parse. Validation problems: {}'.format(validation_problems))
        return

    org = Organization.objects.get(id=descriptor['organization_id'])

    if not skip_authorization and org != requesting_user.organization:
        validation_problems.append({'row': None, 'message': 'Organization mismatch!'})
        logger.critical('Organization mismatch!')
        return

    make_assoc = VehicleMakeOrganization.objects.filter(organization=org)
    permitted_makes = [ma.vehicle_make for ma in make_assoc]

    submission = SalesSubmission.objects.create(
        create_user=requesting_user,
        update_user=requesting_user,
        organization=org,
        submission_sequence=SalesSubmission.next_sequence(org, datetime.now())
    )
    submission.save()

    for input_sheet in descriptor['sheets']:
        try:
            sheet = wb.sheet_by_name(input_sheet['name'])
        except XLRDError:
            logger.info('Sheet {} missing'.format(input_sheet))
            validation_problems.append(
                {'row': None, 'message': 'Expected to find a sheet called {}, and it is not present. Skipping it.'})
            continue

        logger.info('Reading sheet {}'.format(input_sheet['name']))

        START_ROW = 4
        row = START_ROW

        while row < min((MAX_READ_ROWS + START_ROW), sheet.nrows):
            row_contents = sheet.row(row)
            vin = str(row_contents[1].value)
            date = row_contents[2].value
            if len(vin) > 0:
                logger.info('Found VIN {}'.format(vin))
                if date == '':
                    validation_problems.append({
                        'row': row + 1,
                        'message': 'VIN {} has no corresponding sale date'.format(vin)
                    })
                else:
                    parsed_date = None
                    try:
                        parsed_date = xlrd.xldate.xldate_as_datetime(date, wb.datemode)
                        logger.debug('I interpret the Excel date string {} as {}'.format(date, parsed_date))
                    except XLDateError:
                        validation_problems.append({
                            'row': row + 1,
                            'message': 'date {} insensible'.format(date)
                        })

                    if RecordOfSale.objects.filter(vin=vin, submission__organization=org).exists():
                        validation_problems.append({
                            'row': row + 1,
                            'message': 'VIN {} has previously been recorded (but will be entered anyway)'.format(vin)
                        })

                    vehicle = Vehicle.objects.get(id=input_sheet['vehicle_id'])
                    if vehicle is None or vehicle.make not in permitted_makes:
                        validation_problems.append({'row': None, 'message': 'Vehicle not found or has incorrect make'})
                        logger.critical('Vehicle not found or has incorrect make')
                        return

                    if parsed_date:
                        ros = RecordOfSale.objects.create(
                            submission=submission,
                            vehicle=vehicle,
                            vin=vin,
                            sale_date=parsed_date,
                            reference_number=None  # @todo assign from sequence
                        )
                        ros.save()
                        entries.append(
                            {'vin': vin,
                             'vin_validation_status': ros.vin_validation_status.value,
                             'sale_date': parsed_date,
                             'id': ros.id,
                             'credits': '??',
                             'model': ros.vehicle.model_name,
                             'model_year': ros.vehicle.model_year.name,
                             'make': ros.vehicle.make.name,
                             'class': ros.vehicle.vehicle_class_code.vehicle_class_code,
                             'range': ros.vehicle.range,
                             'type': ros.vehicle.vehicle_zev_type.vehicle_zev_code,
                             }
                        )
                        logger.info('Recorded sale {}'.format(vin))

            row += 1

    if len(validation_problems) > 0:
        logger.info('Noncritical validation errors encountered: {}'.format(validation_problems))

    logger.info('Done processing spreadsheet')

    return {
        'id': submission.id,
        'submissionID': datetime.now().strftime("%Y-%m-%d"),
        'validation_problems': validation_problems,
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

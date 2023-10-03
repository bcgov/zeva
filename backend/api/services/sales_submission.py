from django.db import connection
from api.models.sales_submission import SalesSubmission
from api.services.credit_transaction import get_map_of_credit_transactions
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.services.send_email import notifications_credit_application
from django.utils import timezone
from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.vehicle import Vehicle
from api.models.record_of_sale import RecordOfSale
from xlrd import xldate, XL_CELL_TEXT, XL_CELL_DATE, XLDateError
from dateutil.parser import parse
import datetime
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from django.core.exceptions import ValidationError
from api.models.model_year_report import ModelYearReport


def get_map_of_sales_submission_ids_to_timestamps(user_is_government):
    result = {}
    sales_submissions = SalesSubmission.objects.only(
        "id", "part_of_model_year_report", "validation_status"
    )
    map_of_submission_ids_to_statuses_and_timestamps = (
        get_map_of_sales_submissions_by_history(
            "submission_id",
            "update_timestamp",
            "DESC",
            "validation_status",
            "update_timestamp",
        )
    )
    map_of_credit_transaction_ids_to_timestamps = get_map_of_credit_transactions(
        "id", "transaction_timestamp"
    )
    map_of_submission_ids_to_credit_transaction_ids = (
        get_map_of_sales_submission_ids_to_credit_transaction_ids()
    )
    for sales_submission in sales_submissions:
        sales_submission_id = sales_submission.id
        sales_submission_status = sales_submission.validation_status.value
        credit_transaction_ids = map_of_submission_ids_to_credit_transaction_ids.get(
            sales_submission_id
        )
        if sales_submission.part_of_model_year_report and credit_transaction_ids:
            credit_transaction_id = credit_transaction_ids[0]
            result[sales_submission_id] = map_of_credit_transaction_ids_to_timestamps[
                credit_transaction_id
            ]
        else:
            statuses_and_timestamps = (
                map_of_submission_ids_to_statuses_and_timestamps.get(
                    sales_submission_id
                )
            )
            if (not user_is_government) and sales_submission_status in [
                SalesSubmissionStatuses.RECOMMEND_REJECTION.value,
                SalesSubmissionStatuses.RECOMMEND_APPROVAL.value,
                SalesSubmissionStatuses.CHECKED.value,
            ]:
                for status_and_timestamp in statuses_and_timestamps:
                    status = status_and_timestamp["validation_status"]
                    if status == SalesSubmissionStatuses.SUBMITTED.value:
                        result[sales_submission_id] = status_and_timestamp[
                            "update_timestamp"
                        ]
                        break
            else:
                for status_and_timestamp in statuses_and_timestamps:
                    status = status_and_timestamp["validation_status"]
                    if status == sales_submission_status:
                        result[sales_submission_id] = status_and_timestamp[
                            "update_timestamp"
                        ]
                        break
        if sales_submission_id not in result:
            result[sales_submission_id] = timezone.now()
    return result


def get_map_of_sales_submission_ids_to_credit_transaction_ids():
    with connection.cursor() as cursor:
        result = {}
        cursor.execute(
            "select sales_submission_id, credit_transaction_id from sales_submission_credit_transaction"
        )
        rows = cursor.fetchall()
        for row in rows:
            sales_submission_id = row[0]
            credit_transaction_id = row[1]
            if sales_submission_id not in result:
                result[sales_submission_id] = []
            result[sales_submission_id].append(credit_transaction_id)
        return result


def get_map_of_sales_submissions_by_history(
    key_field,
    order_field,
    order_direction,
    *value_fields,
):
    with connection.cursor() as cursor:
        result = {}
        sql_fields = ""
        for index, value_field in enumerate(value_fields):
            if index == 0:
                sql_fields = sql_fields + value_field
            else:
                sql_fields = sql_fields + ", " + value_field
        cursor.execute(
            "select {key_field}, {fields} from sales_submission_history order by {order_field} {order_direction}".format(
                key_field=key_field,
                fields=sql_fields,
                order_field=order_field,
                order_direction=order_direction,
            )
        )
        histories = cursor.fetchall()
        for history in histories:
            key = history[0]
            values = {}
            for index, value_field in enumerate(value_fields):
                values[value_field] = history[index + 1]
            if key not in result:
                result[key] = []
            result[key].append(values)
        return result


def check_validation_status_change(current_status, new_status, submission):
    if type(current_status) is SalesSubmissionStatuses:
        current_status = current_status.name
    if type(new_status) is SalesSubmissionStatuses:
        new_status = new_status.name

    if new_status != current_status:
        notifications_credit_application(submission)


def get_vehicle_structures(sales_submission, vehicle_definition_status):
    makes_map = {}
    model_names_map = {}
    model_years_map = {}

    vehicles = Vehicle.objects.filter(
        organization=sales_submission.organization
    ).filter(validation_status=vehicle_definition_status)

    for vehicle in vehicles:
        make = vehicle.make.lower()
        model_name = vehicle.model_name
        model_year = vehicle.model_year.name
        if makes_map.get(make) is None:
            makes_map[make] = set()
        makes_map[make].add(vehicle)
        if model_names_map.get(model_name) is None:
            model_names_map[model_name] = set()
        model_names_map[model_name].add(vehicle)
        if model_years_map.get(model_year) is None:
            model_years_map[model_year] = set()
        model_years_map[model_year].add(vehicle)

    return {
        "makes_map": makes_map,
        "model_names_map": model_names_map,
        "model_years_map": model_years_map,
    }


def get_map_of_vins_to_records_of_sales(sales_submission_contents):
    result = {}
    vins = []
    for content in sales_submission_contents:
        vins.append(content.xls_vin)
    sale_records = RecordOfSale.objects.filter(vin__in=vins).select_related(
        "submission", "vehicle"
    )
    for sale_record in sale_records:
        vin = sale_record.vin
        if vin:
            if result.get(vin) is None:
                result[vin] = set()
            result[vin].add(sale_record)
    return result


def get_map_of_vins_to_icbc_data(sales_submission_contents):
    result = {}
    vins = []
    for content in sales_submission_contents:
        vins.append(content.xls_vin)
    icbc_records = IcbcRegistrationData.objects.filter(vin__in=vins).select_related(
        "icbc_vehicle__model_year", "icbc_upload_date"
    )
    for icbc_record in icbc_records:
        result[icbc_record.vin] = icbc_record
    return result


def get_map_of_sales_submission_content_ids_to_vehicles(
    sales_submission_contents, vehicle_structures
):
    result = {}
    for content in sales_submission_contents:
        content_id = content.id
        try:
            model_year = float(content.xls_model_year)
        except ValueError:
            continue
        vehicles_by_make = vehicle_structures["makes_map"].get(content.xls_make.lower())
        vehicles_by_model_name = vehicle_structures["model_names_map"].get(
            content.xls_model
        )
        vehicles_by_model_year = vehicle_structures["model_years_map"].get(
            str(int(model_year))
        )

        if (
            vehicles_by_make is None
            or vehicles_by_model_name is None
            or vehicles_by_model_year is None
        ):
            continue

        matching_vehicles = (
            vehicles_by_make.intersection(vehicles_by_model_name)
        ).intersection(vehicles_by_model_year)

        if not matching_vehicles:
            continue

        final_matching_vehicles = []
        for vehicle in matching_vehicles:
            if vehicle.create_timestamp < content.update_timestamp:
                final_matching_vehicles.append(vehicle)

        if final_matching_vehicles:
            result[content_id] = final_matching_vehicles[0]

    return result


def add_warning(warnings, sales_submission_content_id, warning):
    if warnings.get(sales_submission_content_id) is None:
        warnings[sales_submission_content_id] = []
    warnings[sales_submission_content_id].append(warning)


def populate_invalid_model_warnings(
    warnings, sales_submission_contents, map_of_sales_submission_content_ids_to_vehicles
):
    warning = "INVALID_MODEL"
    for content in sales_submission_contents:
        content_id = content.id
        if map_of_sales_submission_content_ids_to_vehicles.get(content_id) is None:
            add_warning(warnings, content_id, warning)


def populate_row_not_selected_warnings(
    warnings,
    sales_submission_contents,
    map_of_vins_to_records_of_sales,
    map_of_sales_submission_content_ids_to_vehicles,
):
    warning = "ROW_NOT_SELECTED"
    for content in sales_submission_contents:
        content_id = content.id
        vin = content.xls_vin
        sale_records = map_of_vins_to_records_of_sales.get(vin)
        if sale_records is None:
            add_warning(warnings, content_id, warning)
            continue
        match_found = False
        vehicle = map_of_sales_submission_content_ids_to_vehicles.get(content_id)
        for sale_record in sale_records:
            if (
                sale_record.vehicle == vehicle
                and sale_record.submission == content.submission
                and sale_record.create_timestamp < content.update_timestamp
            ):
                match_found = True
                break
        if not match_found:
            add_warning(warnings, content_id, warning)


def populate_date_warnings(warnings, sales_submission_contents):
    invalid_date_warning = "INVALID_DATE"
    expired_date_warning = "EXPIRED_REGISTRATION_DATE"
    for content in sales_submission_contents:
        content_id = content.id
        sale_date = None
        if content.xls_date_type == XL_CELL_DATE:
            try:
                date_float = float(content.xls_sale_date)
            except ValueError:
                add_warning(warnings, content_id, invalid_date_warning)
                continue

            try:
                sale_date = xldate.xldate_as_datetime(date_float, content.xls_date_mode)
            except XLDateError:
                add_warning(warnings, content_id, invalid_date_warning)

        elif content.xls_date_type == XL_CELL_TEXT:
            try:
                sale_date = parse(str(content.xls_sale_date), fuzzy=True)
            except ValueError:
                add_warning(warnings, content_id, invalid_date_warning)

        if sale_date is not None and sale_date < datetime.datetime(2018, 1, 2):
            add_warning(warnings, content_id, expired_date_warning)


def populate_already_awarded_warnings(
    warnings,
    sales_submission_contents,
    map_of_vins_to_records_of_sales,
):
    warning = "VIN_ALREADY_AWARDED"
    for content in sales_submission_contents:
        content_id = content.id
        vin = content.xls_vin
        sale_records = map_of_vins_to_records_of_sales.get(vin)
        if sale_records is None:
            continue
        matching_records = []
        for sale_record in sale_records:
            if (
                sale_record.submission.validation_status
                != SalesSubmissionStatuses.REJECTED
                and sale_record.submission != content.submission
                and sale_record.create_timestamp < content.update_timestamp
            ):
                matching_records.append(sale_record)
        if matching_records:
            add_warning(warnings, content_id, warning)


def populate_is_duplicate_warnings(warnings, sales_submission_contents):
    warning = "DUPLICATE_VIN"
    map_of_vins_to_contents = {}
    for content in sales_submission_contents:
        vin = content.xls_vin
        if vin not in map_of_vins_to_contents:
            map_of_vins_to_contents[vin] = []
        map_of_vins_to_contents[vin].append(content)

    for contents in map_of_vins_to_contents.values():
        if len(contents) > 1:
            for duplicate in contents:
                add_warning(warnings, duplicate.id, warning)


def populate_icbc_warnings(
    warnings,
    sales_submission_contents,
    map_of_sales_submission_content_ids_to_vehicles,
    map_of_vins_to_icbc_data,
):
    no_match_warning = "NO_ICBC_MATCH"
    model_year_mismatch_warning = "MODEL_YEAR_MISMATCHED"
    make_mismatch_warning = "MAKE_MISMATCHED"

    for content in sales_submission_contents:
        content_id = content.id
        vin = content.xls_vin
        icbc_record = map_of_vins_to_icbc_data.get(vin)
        if icbc_record is None:
            add_warning(warnings, content_id, no_match_warning)
            continue

        vehicle = map_of_sales_submission_content_ids_to_vehicles.get(content_id)
        if vehicle is not None:
            if icbc_record.icbc_vehicle.model_year != vehicle.model_year:
                add_warning(warnings, content_id, model_year_mismatch_warning)
            if icbc_record.icbc_vehicle.make != vehicle.make:
                add_warning(warnings, content_id, make_mismatch_warning)


def populate_wrong_model_year_warnings(
    warnings, sales_submission, sales_submission_contents
):
    warning = "WRONG_MODEL_YEAR"
    if sales_submission.part_of_model_year_report is True:
        reports = (
            ModelYearReport.objects.filter(organization=sales_submission.organization)
            .filter(validation_status__in=["SUBMITTED", "RECOMMENDED", "RETURNED"])
            .select_related("model_year")
        )
        model_years_of_reports = set()
        for report in reports:
            model_years_of_reports.add(report.model_year.name)

        for content in sales_submission_contents:
            content_id = content.id
            if content.submission == sales_submission:
                model_year = content.xls_model_year
                if model_year not in model_years_of_reports:
                    add_warning(warnings, content_id, warning)


def get_helping_objects(sales_submission_contents):
    sales_submission = None
    for index, content in enumerate(sales_submission_contents):
        if index != 0 and content.submission != sales_submission:
            raise ValidationError(
                "sales submission contents should all belong to the same sales submission"
            )
        sales_submission = content.submission

    vehicle_structures = get_vehicle_structures(
        sales_submission, VehicleDefinitionStatuses.VALIDATED
    )
    map_of_vins_to_records_of_sales = get_map_of_vins_to_records_of_sales(
        sales_submission_contents
    )
    map_of_vins_to_icbc_data = get_map_of_vins_to_icbc_data(sales_submission_contents)
    map_of_sales_submission_content_ids_to_vehicles = (
        get_map_of_sales_submission_content_ids_to_vehicles(
            sales_submission_contents, vehicle_structures
        )
    )
    return {
        "sales_submission": sales_submission,
        "map_of_vins_to_records_of_sales": map_of_vins_to_records_of_sales,
        "map_of_vins_to_icbc_data": map_of_vins_to_icbc_data,
        "map_of_sales_submission_content_ids_to_vehicles": map_of_sales_submission_content_ids_to_vehicles,
    }


def get_warnings_and_maps(sales_submission_contents):
    if not sales_submission_contents:
        return {
            "warnings": {},
            "map_of_vins_to_records_of_sales": {},
            "map_of_vins_to_icbc_data": {},
            "map_of_sales_submission_content_ids_to_vehicles": {},
        }
    
    helping_objects = get_helping_objects(sales_submission_contents)
    sales_submission = helping_objects["sales_submission"]
    map_of_vins_to_records_of_sales = helping_objects["map_of_vins_to_records_of_sales"]
    map_of_vins_to_icbc_data = helping_objects["map_of_vins_to_icbc_data"]
    map_of_sales_submission_content_ids_to_vehicles = helping_objects["map_of_sales_submission_content_ids_to_vehicles"]

    warnings = {}
    populate_invalid_model_warnings(
        warnings,
        sales_submission_contents,
        map_of_sales_submission_content_ids_to_vehicles,
    )
    populate_date_warnings(warnings, sales_submission_contents)
    populate_already_awarded_warnings(
        warnings, sales_submission_contents, map_of_vins_to_records_of_sales
    )
    populate_is_duplicate_warnings(warnings, sales_submission_contents)
    populate_icbc_warnings(
        warnings,
        sales_submission_contents,
        map_of_sales_submission_content_ids_to_vehicles,
        map_of_vins_to_icbc_data,
    )
    populate_wrong_model_year_warnings(
        warnings, sales_submission, sales_submission_contents
    )

    return {
        "warnings": warnings,
        "map_of_vins_to_records_of_sales": map_of_vins_to_records_of_sales,
        "map_of_vins_to_icbc_data": map_of_vins_to_icbc_data,
        "map_of_sales_submission_content_ids_to_vehicles": map_of_sales_submission_content_ids_to_vehicles,
    }

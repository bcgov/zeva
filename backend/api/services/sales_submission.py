from django.db import connection
from api.models.sales_submission import SalesSubmission
from api.services.credit_transaction import get_map_of_credit_transactions
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from django.utils import timezone


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

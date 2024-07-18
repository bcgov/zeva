from api.services.credit_transaction_type import get_transaction_type
from api.services.weight_class import get_weight_class_by_code
from api.utilities.compliance_period import get_compliance_year
from django.utils import timezone


def get_reduction_number_of_credits():
    return 1


def get_reduction_timestamp(model_year):
    return "{}-09-30".format(int(model_year) + 1)


def get_reduction_transaction_type():
    return get_transaction_type("Reduction")


def get_reduction_weight_class():
    return get_weight_class_by_code(get_reduction_weight_class_code())


def get_reduction_weight_class_code():
    return "LDV"


def is_backdated(credit_transaction):
    current_compliance_year = get_compliance_year(timezone.now())
    transaction_compliance_year = get_compliance_year(
        credit_transaction.transaction_timestamp
    )
    if (transaction_compliance_year + 1) == current_compliance_year:
        return True
    return False


def access_forbidden(user, organization):
    if (not user.is_government) and (user.organization != organization):
        return True
    return False


def get_signed_value(credit_transaction, organization):
    result = 0
    total_value = credit_transaction.total_value
    credit_to = credit_transaction.credit_to
    debit_from = credit_transaction.debit_from
    if credit_to == organization:
        result = result + total_value
    if debit_from == organization:
        result = result + (total_value * -1)
    return result


def get_category(credit_transaction):
    transaction_type = credit_transaction.transaction_type.transaction_type
    if transaction_type == "Credit Adjustment Reduction":
        return "administrativeReduction"
    if transaction_type == "Credit Adjustment Validation":
        return "administrativeAllocation"

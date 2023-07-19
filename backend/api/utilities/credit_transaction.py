from api.services.credit_transaction_type import get_transaction_type
from api.services.weight_class import get_weight_class_by_code


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

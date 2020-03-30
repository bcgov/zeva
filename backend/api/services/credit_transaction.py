from api.models.credit_transaction import CreditTransaction
from api.models.credit_transaction_type import CreditTransactionType
from api.models.record_of_sale import RecordOfSale


def award_credits(submission):
    credit_value_a = 0
    credit_value_b = 0

    record_of_sales = RecordOfSale.objects.filter(
        submission_id=submission.id,
        validation_status="VALIDATED",
    )

    for record_of_sale in record_of_sales:
        if record_of_sale.vehicle.vehicle_zev_type.vehicle_zev_code == 'BEV':
            credit_value_a += record_of_sale.vehicle.get_credit_value()
        else:
            credit_value_b += record_of_sale.vehicle.get_credit_value()
        print(record_of_sale.vehicle.get_credit_value())

    if credit_value_a > 0:
        CreditTransaction.objects.create(
            create_user=submission.update_user,
            credit_class_id="A",
            credit_to=submission.organization,
            credit_value=credit_value_a,
            transaction_type_id="Validation"
        )

    if credit_value_b > 0:
        CreditTransaction.objects.create(
            create_user=submission.update_user,
            credit_class_id="B",
            credit_to=submission.organization,
            credit_value=credit_value_b,
            transaction_type_id="Validation"
        )

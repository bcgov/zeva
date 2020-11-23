
from django.db.models import Sum, Value, Q
from django.db.models.functions import Coalesce
from api.services.credit_transaction import aggregate_credit_balance_details

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_content import CreditTransferContent
from api.models.credit_transfer_statuses import CreditTransferStatuses


def aggregate_credit_transfer_details(org_id):

    transfer_to = CreditTransfer.objects.filter(Q(credit_to=org_id) &
                    Q(status__in=[
                        CreditTransferStatuses.SUBMITTED,
                        CreditTransferStatuses.APPROVED,
                        CreditTransferStatuses.RECOMMEND_APPROVAL
                        ]))

    transfer_from = CreditTransfer.objects.filter(Q(debit_from=org_id) &
                    Q(status__in=[
                        CreditTransferStatuses.SUBMITTED,
                        CreditTransferStatuses.APPROVED,
                        CreditTransferStatuses.RECOMMEND_APPROVAL
                        ]))
    
    balance_credits = Coalesce(Sum('credit_value', filter=Q(
        credit_transfer_id__in = transfer_to
    )), Value(0))

    balance_debits = Coalesce(Sum('credit_value', filter=Q(
        credit_transfer_id__in = transfer_from
    )), Value(0))
 
    balance = CreditTransferContent.objects.filter(Q(credit_transfer__in = transfer_to) | Q(credit_transfer__in = transfer_from)
    ).values(
        'model_year_id', 'credit_class_id', 'weight_class_id'
    ).annotate(
        credit=balance_credits,
        debit=balance_debits,
        credit_value=balance_credits - balance_debits
    ).order_by('model_year_id', 'credit_class_id', 'weight_class_id')
    return balance

def calculate_insufficient_credits(org_id):
    issued_balances = aggregate_credit_balance_details(org_id)
    issued_balances_list = list(issued_balances)
    pending_balance = aggregate_credit_transfer_details(org_id)
    for index, balance in enumerate(issued_balances_list):
        pending = pending_balance.filter(model_year_id=balance['model_year_id'],credit_class_id=balance['credit_class_id'], weight_class_id=balance['weight_class_id']).first()
        if pending:
            total_balance = balance['total_value'] + pending['credit_value']
            update_list = { "model_year_id":balance['model_year_id'],
                            "credit_class_id":balance['credit_class_id'],
                            "weight_class_id":balance['weight_class_id'],
                            "credit":balance['credit'],
                            "debit":balance['debit'],
                            "total_value":total_balance}
            issued_balances_list[index] = update_list

    return issued_balances_list






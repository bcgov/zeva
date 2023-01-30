
from django.db.models import Sum, Value, Q, FloatField, ExpressionWrapper, F
from django.db.models.functions import Coalesce

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
        credit_transfer_id__in=transfer_to
    )), Value(0), output_field=FloatField())

    balance_debits = Coalesce(Sum('credit_value', filter=Q(
        credit_transfer_id__in=transfer_from
    )), Value(0), output_field=FloatField())
 
    balance = CreditTransferContent.objects.filter(
        Q(credit_transfer__in=transfer_to)
        | Q(credit_transfer__in=transfer_from)
        ).values(
        'model_year_id', 'credit_class_id', 'weight_class_id'
    ).annotate(
        credit=balance_credits,
        debit=balance_debits,
        credit_value=ExpressionWrapper(F('credit') - F('debit'),
          output_field=FloatField())
    ).order_by('model_year_id', 'credit_class_id', 'weight_class_id')
    return balance

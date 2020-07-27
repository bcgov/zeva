from datetime import date
from decimal import Decimal
from django.db.models import Count, Sum, Value, F, Q
from django.db.models.functions import Coalesce

from api.models.credit_transaction import CreditTransaction
from api.models.record_of_sale import RecordOfSale
from api.models.vehicle import Vehicle
from api.models.account_balance import AccountBalance
from api.models.credit_class import CreditClass
from api.models.credit_transaction_type import CreditTransactionType
from api.models.weight_class import WeightClass


def award_credits(submission):
    records = RecordOfSale.objects.filter(
        submission_id=submission.id,
        validation_status="VALIDATED",
    ).values('vehicle_id').annotate(total=Count('id')).order_by('vehicle_id')

    weight_class = WeightClass.objects.get(weight_class_code="LDV")

    for record in records:
        vehicle = Vehicle.objects.get(id=record.get('vehicle_id'))
        credit_value = record.get('total') * vehicle.get_credit_value()
        credit_class = vehicle.get_credit_class()
        if credit_class in ['A', 'B']:
            credit_transaction = CreditTransaction.objects.create(
                create_user=submission.update_user,
                credit_class=CreditClass.objects.get(
                    credit_class=credit_class
                ),
                credit_to=submission.organization,
                credit_value=credit_value,
                model_year=vehicle.model_year,
                transaction_type=CreditTransactionType.objects.get(
                    transaction_type="Validation"
                ),
                update_user=submission.update_user,
                weight_class=weight_class
            )
            current_balance = AccountBalance.objects.filter(
                credit_class=CreditClass.objects.get(
                    credit_class=credit_class
                ),
                organization_id=vehicle.organization_id,
                expiration_date=None
            ).order_by('-id').first()

            if current_balance:
                new_balance = Decimal(current_balance.balance) + Decimal(credit_value)
                current_balance.expiration_date = date.today()
                current_balance.save()
            else:
                new_balance = credit_value

            AccountBalance.objects.create(
                balance=new_balance,
                effective_date=date.today(),
                credit_class=CreditClass.objects.get(
                    credit_class=credit_class
                ),
                credit_transaction=credit_transaction,
                organization_id=vehicle.organization_id
            )


def aggregate_credit_balance_details(organization):
    balance_credits = Coalesce(Sum('credit_value', filter=Q(
        credit_to=organization
    )), 0)

    balance_debits = Coalesce(Sum('credit_value', filter=Q(
        debit_from=organization
    )), 0)

    balance = CreditTransaction.objects.filter(
        Q(credit_to=organization) |
        Q(debit_from=organization)
    ).values(
        'model_year_id', 'credit_class_id', 'weight_class_id'
    ).annotate(
        credit=balance_credits,
        debit=balance_debits,
        credit_value=F('credit') - F('debit')
    ).order_by('model_year_id', 'credit_class_id', 'weight_class_id')

    return balance

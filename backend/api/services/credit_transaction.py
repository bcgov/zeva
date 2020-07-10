from django.db.models import Count
from api.models.credit_transaction import CreditTransaction
from api.models.record_of_sale import RecordOfSale
from api.models.vehicle import Vehicle
from api.models.account_balance import AccountBalance
from api.models.credit_class import CreditClass
from datetime import date
from decimal import Decimal

def award_credits(submission):
    records = RecordOfSale.objects.filter(
        submission_id=submission.id,
        validation_status="VALIDATED",
    ).values('vehicle_id').annotate(total=Count('id')).order_by('vehicle_id')

    for record in records:
        vehicle = Vehicle.objects.get(id=record.get('vehicle_id'))
        credit_value = record.get('total') * vehicle.get_credit_value()
        credit_class = vehicle.get_credit_class()
        if credit_class in ['A', 'B']:
            credit_transaction = CreditTransaction.objects.create(
                create_user=submission.update_user,
                credit_class_id=credit_class,
                credit_to=submission.organization,
                credit_value=credit_value,
                update_user=submission.update_user,
                transaction_type_id="Validation",
                vehicle_id=vehicle.id
            )
            current_balance = AccountBalance.objects.filter(
                credit_class_id=credit_class,
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
                credit_class_id=credit_class,
                credit_transaction=credit_transaction,
                organization_id=vehicle.organization_id
            )

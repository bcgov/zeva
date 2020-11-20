from datetime import date
from decimal import Decimal
from django.db.models import Case, Count, Sum, Value, F, Q, When, Max
from django.db.models.functions import Coalesce
from django.db import transaction
from api.models.account_balance import AccountBalance
from api.models.credit_class import CreditClass
from api.models.credit_transaction import CreditTransaction
from api.models.credit_transaction_type import CreditTransactionType
from api.models.sales_submission_credit_transaction import \
    SalesSubmissionCreditTransaction
from api.models.record_of_sale import RecordOfSale
from api.models.vehicle import Vehicle
from api.models.weight_class import WeightClass


def award_credits(submission):
    records = RecordOfSale.objects.filter(
        submission_id=submission.id,
        validation_status="VALIDATED",
    ).values('vehicle_id').annotate(total=Count('id')).order_by('vehicle_id')

    weight_class = WeightClass.objects.get(weight_class_code="LDV")

    for record in records:
        vehicle = Vehicle.objects.get(id=record.get('vehicle_id'))
        number_of_credits = record.get('total')
        credit_value = vehicle.get_credit_value()
        total_value = number_of_credits * credit_value
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
                number_of_credits=number_of_credits,
                total_value=total_value,
                transaction_type=CreditTransactionType.objects.get(
                    transaction_type="Validation"
                ),
                update_user=submission.update_user,
                weight_class=weight_class
            )

            SalesSubmissionCreditTransaction.objects.create(
                sales_submission_id=submission.id,
                credit_transaction_id=credit_transaction.id
            )

            current_balance = AccountBalance.objects.filter(
                credit_class=CreditClass.objects.get(
                    credit_class=credit_class
                ),
                organization_id=submission.organization.id,
                expiration_date=None
            ).order_by('-id').first()

            if current_balance:
                new_balance = Decimal(current_balance.balance) + \
                    Decimal(total_value)
                current_balance.expiration_date = date.today()
                current_balance.save()
            else:
                new_balance = total_value

            AccountBalance.objects.create(
                balance=new_balance,
                effective_date=date.today(),
                credit_class=CreditClass.objects.get(
                    credit_class=credit_class
                ),
                credit_transaction=credit_transaction,
                organization_id=submission.organization.id
            )


def aggregate_credit_balance_details(organization):
    balance_credits = Coalesce(Sum('total_value', filter=Q(
        credit_to=organization
    )), Value(0))

    balance_debits = Coalesce(Sum('total_value', filter=Q(
        debit_from=organization
    )), Value(0))

    balance = CreditTransaction.objects.filter(
        Q(credit_to=organization) | Q(debit_from=organization)
    ).values(
        'model_year_id', 'credit_class_id', 'weight_class_id'
    ).annotate(
        credit=balance_credits,
        debit=balance_debits,
        total_value=F('credit') - F('debit')
    ).order_by('model_year_id', 'credit_class_id', 'weight_class_id')

    return balance


def aggregate_transactions_by_submission(organization):
    balance_credits = Coalesce(Sum('total_value', filter=Q(
        credit_to=organization
    )), Value(0))

    balance_debits = Coalesce(Sum('total_value', filter=Q(
        debit_from=organization
    )), Value(0))

    foreign_key = Case(
        When(transaction_type=CreditTransactionType.objects.get(
            transaction_type="Validation"
        ), then=F(
            'sales_submission_credit_transaction__sales_submission_id'
        )),
        When(transaction_type=CreditTransactionType.objects.get(
            transaction_type="Credit Transfer"
        ), then=F(
            'credit_transfer_credit_transaction__credit_transfer_id'
        )),
        default=Value(None)
    )

    transactions = CreditTransaction.objects.filter(
        Q(credit_to=organization) | Q(debit_from=organization)
    ).values(
        'credit_class_id', 'transaction_type_id'
    ).annotate(
        credit=balance_credits,
        debit=balance_debits,
        foreign_key=foreign_key,
        total_value=F('credit') - F('debit'),
        transaction_timestamp=Max('transaction_timestamp')
    ).order_by(
        'credit_class_id', 'transaction_type_id'
    )

    return transactions


@transaction.atomic
def validate_transfer(transfer):
    initiating_supplier = transfer.debit_from
    recieving_supplier = transfer.credit_to
    content = transfer.credit_transfer_content.all()
    credit_total = {}
    added_transaction = {}
    for each in content:
        #aggregate by unique combinations of credit year/type
        credit_value = each.credit_value
        model_year = each.model_year.id
        credit_type = each.credit_class.id
        
        if model_year not in credit_total:
            credit_total[model_year] = {credit_type: credit_value}
        else:
            credit_total[model_year][credit_type] += credit_value
    for year, v in credit_total.items():
        for credit_class, credit_value in v.items():
            #add record for each unique combination to credit transaction table
            added_transaction = CreditTransaction.objects.create(
                create_user=transfer.update_user,
                credit_class=CreditClass.objects.get(
                    id=credit_class
                ),
                debit_from=transfer.debit_from,
                credit_to=transfer.credit_to,
                model_year_id=year,
                number_of_credits=1,
                credit_value=credit_value,
                transaction_type=CreditTransactionType.objects.get(
                    transaction_type="Credit Transfer"
                ),
                total_value=1 * credit_value,
                update_user=transfer.update_user,
                weight_class_id=1
            )
    for each_supplier in [initiating_supplier, recieving_supplier]:
        ## right now it's inserting records seperately for each
        ## model year but we aren't tracking that on the balance
        ## table so we can combine it so uneccesary records
        ## aren't added
        print(each_supplier.name)
        reduce_total = each_supplier == transfer.debit_from
        add_total = each_supplier == transfer.credit_to
        for year, v in credit_total.items():
            for credit_class, credit_value in v.items():
                new_balance = 0
                current_balance = AccountBalance.objects.filter(
                    credit_class=credit_class,
                    organization_id=each_supplier.id,
                    expiration_date=None
                    ).order_by('-id').first()
                if current_balance:
                    if reduce_total:
                        new_balance = Decimal(current_balance.balance) - \
                            Decimal(credit_value)
                    if add_total:
                        new_balance = Decimal(current_balance.balance) + \
                            Decimal(credit_value)
                    current_balance.expiration_date = date.today()
                    current_balance.save()
                else:
                    if add_total:
                        new_balance = credit_value
                    elif reduce_total:
                        ## if they don't have a balance we should probably not allow this transfer
                        new_balance = 0 - credit_value
                        print('going into negatives')
                AccountBalance.objects.create(
                    balance=new_balance,
                    effective_date=date.today(),
                    credit_class=CreditClass.objects.get(
                        id=credit_class
                    ),
                    credit_transaction=added_transaction,
                    organization_id=each_supplier.id
                )

                


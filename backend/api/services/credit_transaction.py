from datetime import date
from decimal import Decimal
from django.db.models import Case, Count, Sum, Value, F, Q, When, Max
from django.db.models.functions import Coalesce
from django.db import transaction
from rest_framework.serializers import ValidationError

from api.models.account_balance import AccountBalance
from api.models.credit_class import CreditClass
from api.models.credit_transaction import CreditTransaction
from api.models.credit_transaction_type import CreditTransactionType
from api.models.credit_transfer_credit_transaction import \
    CreditTransferCreditTransaction
from api.models.sales_submission_credit_transaction import \
    SalesSubmissionCreditTransaction
from api.models.record_of_sale import RecordOfSale
from api.models.vehicle import Vehicle
from api.models.weight_class import WeightClass

from api.services.credit_transfer import aggregate_credit_transfer_details


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
        When(transaction_type=CreditTransactionType.objects.get(
            transaction_type="Reduction"
        ), then=F(
            'model_year_report_credit_transaction__model_year_report_id'
        )),
        default=Value(None)
    )

    transactions = CreditTransaction.objects.filter(
        Q(credit_to=organization) | Q(debit_from=organization)
    ).values(
        'credit_class_id', 'transaction_type_id', 'model_year_id'
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


def calculate_insufficient_credits(org_id):
    issued_balances = aggregate_credit_balance_details(org_id)
    issued_balances_list = list(issued_balances)
    pending_balance = aggregate_credit_transfer_details(org_id)
    for index, balance in enumerate(issued_balances_list):
        pending = pending_balance.filter(
            model_year_id=balance['model_year_id'],
            credit_class_id=balance['credit_class_id'],
            weight_class_id=balance['weight_class_id']
            ).first()
        if pending:
            total_balance = balance['total_value'] + pending['credit_value']
            update_list = { "model_year_id": balance['model_year_id'],
                            "credit_class_id": balance['credit_class_id'],
                            "weight_class_id": balance['weight_class_id'],
                            "credit": balance['credit'],
                            "debit": balance['debit'],
                            "total_value": total_balance}
            issued_balances_list[index] = update_list
    return issued_balances_list


@transaction.atomic
def validate_transfer(transfer):
    initiating_supplier = transfer.debit_from
    receiving_supplier = transfer.credit_to
    content = transfer.credit_transfer_content.all()
    supplier_totals = aggregate_credit_balance_details(initiating_supplier.id)
    credit_total = {}
    credit_total_no_years = {}
    added_transaction = {}
    has_enough = True
    for each in content:
        found = False
        # aggregate by unique combinations of credit year/type
        credit_value = each.credit_value
        model_year = each.model_year.id
        credit_type = each.credit_class.id
        weight_type = each.weight_class.id
        # check if supplier has enough for this transfer
        for record in supplier_totals:
            if (record['model_year_id'] == model_year and record[
                'credit_class_id'] == credit_type
                    and record['weight_class_id'] == weight_type):
                found = True
                record['total_value'] -= credit_value
                if record['total_value'] < 0:
                    has_enough = False
        if not found:
            has_enough = False
        if not has_enough:
            raise ValidationError('Supplier has insufficient credits to fulfil this transfer.')
        else:
            # add to each dictionary (one broken down by years and the other not)
            if credit_type not in credit_total_no_years:
                credit_total_no_years[credit_type] = credit_value
            else:
                credit_total_no_years[credit_type] += credit_value
            if model_year not in credit_total:
                credit_total[model_year] = {credit_type: credit_value}
            else:
                credit_total[model_year][credit_type] += credit_value

    for year, v in credit_total.items():
        for credit_class, credit_value in v.items():
            # add record for each unique combination to credit transaction table
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
                weight_class=WeightClass.objects.get(
                    weight_class_code='LDV')
            )

            CreditTransferCreditTransaction.objects.create(
                create_user=transfer.update_user,
                credit_transaction_id=added_transaction.id,
                credit_transfer_id=transfer.id,
                update_user=transfer.update_user,
            )

    for each_supplier in [initiating_supplier, receiving_supplier]:
        reduce_total = each_supplier == transfer.debit_from
        add_total = each_supplier == transfer.credit_to
        for credit_class, credit_value in credit_total_no_years.items():
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
            AccountBalance.objects.create(
                balance=new_balance,
                effective_date=date.today(),
                credit_class=CreditClass.objects.get(
                    id=credit_class
                ),
                credit_transaction=added_transaction,
                organization_id=each_supplier.id
            )

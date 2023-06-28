from datetime import date
from api.models.credit_transaction import CreditTransaction
from django.db.models import Sum


def parse_summary_serializer(lst, serializer_data, category):
    index = 0
    found = False
    model_year = serializer_data['model_year'].get('name')
    credit_class = serializer_data['credit_class'].get('credit_class')
    total_value = serializer_data.get('total_value')

    for data in lst:
        if data.get('model_year') and \
                data.get('model_year').get('name') == model_year and \
                data.get('category') == category:
            found = True
            break

        index += 1

    if found:
        if credit_class == 'A':
            lst[index]['credit_a_value'] = float(total_value)
        elif credit_class == 'B':
            lst[index]['credit_b_value'] = float(total_value)
    else:
        lst.append({
            'credit_a_value': float(total_value) if credit_class == 'A' else 0,
            'credit_b_value': float(total_value) if credit_class == 'B' else 0,
            'category': category,
            'model_year': {'name': model_year}
        })


def get_current_year_balance(organization_id, year, credit_type):
    total_issued = 0
    total_transfers_in = 0
    total_transfers_out = 0
    from_date = None
    to_date = None

    if year == 2020:
        from_date = date(2018, 1, 2,)
        to_date = date(year + 1, 9, 30,)
    else:
        from_date = date(year, 10, 1,)
        to_date = date(year + 1, 9, 30,)

    issued_credits = CreditTransaction.objects.filter(
                credit_to_id=organization_id,
                transaction_type__transaction_type='Validation',
                transaction_timestamp__lte=to_date,
                transaction_timestamp__gte=from_date,
                credit_class__credit_class=credit_type
            ).values(
                'credit_class_id', 'model_year_id'
            ).annotate(
                total_value=Sum('total_value')
            ).order_by(
                'credit_class_id', 'model_year_id'
            )

    for c in list(issued_credits):
        total_issued += c['total_value']

    transfers_in = CreditTransaction.objects.filter(
        credit_to_id=organization_id,
        transaction_type__transaction_type='Credit Transfer',
        transaction_timestamp__lte=to_date,
        transaction_timestamp__gte=from_date,
        credit_class__credit_class=credit_type
    ).values(
        'credit_class_id', 'model_year_id'
    ).annotate(
        total_value=Sum('total_value')
    ).order_by(
        'credit_class_id', 'model_year_id'
    )
    if transfers_in:
        for t in transfers_in:
            total_transfers_in += t['total_value']

    transfers_out = CreditTransaction.objects.filter(
        debit_from_id=organization_id,
        transaction_type__transaction_type='Credit Transfer',
        transaction_timestamp__lte=to_date,
        transaction_timestamp__gte=from_date,
        credit_class__credit_class=credit_type
    ).values(
        'credit_class_id', 'model_year_id'
    ).annotate(total_value=Sum(
        'total_value')
    ).order_by(
        'credit_class_id', 'model_year_id'
    )

    if transfers_out:
        for t in transfers_out:
            total_transfers_out += t['total_value']

    balance = ((total_issued + total_transfers_in) - total_transfers_out)

    if balance:
        return balance

    return 0


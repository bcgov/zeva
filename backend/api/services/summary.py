from datetime import date
from api.models.account_balance import AccountBalance


def parse_summary_serializer(lst, serializer_data, category):
    index = 0
    found = False
    model_year = serializer_data['model_year'].get('name')
    credit_class = serializer_data['credit_class'].get('credit_class')
    total_value = serializer_data.get('total_value')
    for data in lst:
        index += 1

        if data.get('model_year') == model_year and \
                data.get('category') == category:
            found = True
            if credit_class == 'A':
                lst[index]['credit_a_value'] = total_value
            elif credit_class == 'B':
                lst[index]['credit_b_value'] = total_value

    if not found:
        lst.append({
            'credit_a_value': total_value if credit_class == 'A' else 0,
            'credit_b_value': total_value if credit_class == 'B' else 0,
            'category': category,
            'model_year': {'name': model_year}
        })


def retrieve_balance(organization_id, year, credit_type):
    balance = AccountBalance.objects.filter(
        organization_id=organization_id,
        effective_date__lte=date(year, 9, 30),
        credit_class__credit_class=credit_type
    ).order_by('-effective_date').first()

    if balance:
        return balance.balance

    return 0

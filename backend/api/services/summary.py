from datetime import date
from api.models.account_balance import AccountBalance


def parse_summary_serializer(lst, serializer_data, category):
    index = 0
    found = False
    for data in lst:
        index += 1

        if data.model_year == serializer_data['model_year'].get('name') and \
                data.category == category:
            found = True
            if serializer_data['credit_class'].get('credit_class') == 'A':
                lst[index].credit_a_value = serializer_data.get('total_value')
            elif serializer_data['credit_class'].get('credit_class') == 'B':
                lst[index].credit_b_value = serializer_data.get('total_value')

    if not found:
        if serializer_data['credit_class'].get('credit_class') == 'A':
            lst.append({
                'credit_a_value': serializer_data.get('total_value'),
                'credit_b_value': 0,
                'category': category,
                'model_year': serializer_data['model_year'].get('name')
            })
        elif serializer_data['credit_class'].get('credit_class') == 'B':
            lst.append({
                'credit_a_value': 0,
                'credit_b_value': serializer_data.get('total_value'),
                'category': category,
                'model_year': serializer_data['model_year'].get('name')
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

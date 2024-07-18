from decimal import Decimal
from datetime import date

from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass
from api.models.credit_transaction import CreditTransaction
from api.models.credit_transaction_type import CreditTransactionType
from api.models.credit_agreement_transaction_types import \
    CreditAgreementTransactionTypes
from api.models.weight_class import WeightClass
from api.models.credit_agreement_credit_transaction import \
    CreditAgreementCreditTransaction
from api.utilities.credit_transaction import is_backdated
from api.utilities.compliance_period import get_compliance_year
from api.models.backdated_credit_transaction import BackdatedCreditTransaction
from api.services.organization import get_current_assessed_report


def adjust_credits(agreement):
    credit_class_a = CreditClass.objects.get(credit_class='A')
    credit_class_b = CreditClass.objects.get(credit_class='B')
    transaction_type = agreement.transaction_type
    content = agreement.credit_agreement_content.all()
    weight_class = WeightClass.objects.get(weight_class_code='LDV')

    total_a_value = 0
    total_b_value = 0
    credit_transaction_type = ''
    debit_from = None
    credit_to = None
    reduce_total = None
    add_total = None
    reset_total = None

    if transaction_type == CreditAgreementTransactionTypes.ADMINISTRATIVE_CREDIT_REDUCTION or transaction_type == CreditAgreementTransactionTypes.REASSESSMENT_REDUCTION:
        credit_transaction_type = "Credit Adjustment Reduction"
        debit_from = agreement.organization
        reduce_total = True
    elif transaction_type == CreditAgreementTransactionTypes.AUTOMATIC_ADMINISTRATIVE_PENALTY:
        credit_transaction_type = "Credit Adjustment Validation"
        credit_to = agreement.organization
        reset_total = True
    else:
        credit_transaction_type = "Credit Adjustment Validation"
        credit_to = agreement.organization
        add_total = True

    for each in content:
        credit_value = each.number_of_credits
        model_year = ModelYear.objects.get(id=each.model_year.id)
        credit_class = CreditClass.objects.get(
                    id=each.credit_class.id)

        added_transaction = CreditTransaction.objects.create(
            create_user=agreement.update_user,
            credit_class=credit_class,
            debit_from=debit_from,
            credit_to=credit_to,
            credit_value=credit_value,
            model_year=model_year,
            number_of_credits=1,
            total_value=1 * credit_value,
            transaction_type=CreditTransactionType.objects.get(
                transaction_type=credit_transaction_type
            ),
            transaction_timestamp=agreement.effective_date,
            update_user=agreement.update_user,
            weight_class=weight_class
            )
        
        if (
            (
                transaction_type
                == CreditAgreementTransactionTypes.ADMINISTRATIVE_CREDIT_REDUCTION
                or transaction_type
                == CreditAgreementTransactionTypes.ADMINISTRATIVE_CREDIT_ALLOCATION
            )
            and is_backdated(added_transaction)
            and get_current_assessed_report(credit_to) is None
            and get_current_assessed_report(debit_from) is None
        ):
            BackdatedCreditTransaction.objects.create(
                credit_transaction=added_transaction,
                compliance_year=get_compliance_year(
                    added_transaction.transaction_timestamp
                ),
                accounted_for_in_model_year_report=False,
                accounted_for_in_supplemental=False,
            )

        if credit_class.credit_class == 'A':
            total_a_value += credit_value
        elif credit_class.credit_class == 'B':
            total_b_value += credit_value

        CreditAgreementCreditTransaction.objects.create(
            create_user=agreement.update_user,
            credit_transaction_id=added_transaction.id,
            credit_agreement_id=agreement.id,
            update_user=agreement.update_user,
        )
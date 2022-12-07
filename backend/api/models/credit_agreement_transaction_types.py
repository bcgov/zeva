from enum import Enum, unique


@unique
class CreditAgreementTransactionTypes(Enum):
    INITIATIVE_AGREEMENT = 'Initiative Agreement'
    PURCHASE_AGREEMENT = 'Purchase Agreement'
    ADMINISTRATIVE_CREDIT_ALLOCATION = 'Administrative Credit Allocation'
    ADMINISTRATIVE_CREDIT_REDUCTION = 'Administrative Credit Reduction'
    AUTOMATIC_ADMINISTRATIVE_PENALTY = 'Automatic Administrative Penalty'
    REASSESSMENT_ALLOCATION = 'Reassessment Allocation' # deprecated but kept for transaction history
    REASSESSMENT_REDUCTION = 'Reassessment Reduction' # deprecated but kept for transaction history

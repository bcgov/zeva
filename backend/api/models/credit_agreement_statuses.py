from enum import Enum, unique


@unique
class CreditAgreementStatuses(Enum):
    DRAFT = 'DRAFT'
    RECOMMENDED = 'RECOMMENDED'
    ISSUED = 'ISSUED'

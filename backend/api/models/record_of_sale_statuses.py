from enum import Enum, unique


@unique
class RecordOfSaleStatuses(Enum):
    NEW = 'NEW'
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    VALIDATED = 'VALIDATED'
    REJECTED = 'REJECTED'
    TRANSACTED = 'TRANSACTED'


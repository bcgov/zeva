from enum import Enum, unique


@unique
class SalesSubmissionStatuses(Enum):
    NEW = 'NEW'
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    VALIDATED = 'VALIDATED'
    REJECTED = 'REJECTED'

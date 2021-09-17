from enum import Enum, unique


@unique
class SupplementalReportStatuses(Enum):
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    RECOMMENDED = 'RECOMMENDED'
    RETURNED = 'RETURNED'
    ASSESSED = 'ASSESSED'
    REASSESSED = 'REASSESSED'

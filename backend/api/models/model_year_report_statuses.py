from enum import Enum, unique


@unique
class ModelYearReportStatuses(Enum):
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'

from enum import Enum, unique


@unique
class VINStatuses(Enum):
    # new status
    UNCHECKED = 'UNCHECKED',

    # valid status
    MATCHED = 'MATCHED',

    # various invalid statuses
    EMPTY_VIN = 'EMPTY_VIN',
    INVALID_VIN = 'INVALID_VIN',
    NOT_IN_PROVINCIAL_RECORDS = 'NOT_IN_PROVINCIAL_RECORDS',
    PREVIOUSLY_MATCHED = 'PREVIOUSLY_MATCHED',
    MODEL_MISMATCH = 'MODEL_MISMATCH',
    MODELYEAR_MISMATCH = 'MODELYEAR_MISMATCH'

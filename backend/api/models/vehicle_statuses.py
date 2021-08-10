from enum import Enum, unique


@unique
class VehicleDefinitionStatuses(Enum):
    NEW = 'NEW'
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    VALIDATED = 'VALIDATED'
    REJECTED = 'REJECTED'
    CHANGES_REQUESTED = 'CHANGES_REQUESTED'
    DELETED = 'DELETED'

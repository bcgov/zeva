from enum import Enum, unique


@unique
class ZEV_TYPE(Enum):
    BEV = "BEV"
    PHEV = "PHEV"
    FCEV = "FCEV"
    EREV = "EREV"

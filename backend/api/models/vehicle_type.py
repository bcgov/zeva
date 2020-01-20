from auditable.models import Auditable
from .mixins.named import Named


class Type(Auditable, Named):
    class Meta:
        db_table = 'vehicle_type'

    db_table_comment = "Type of engine the vehicle uses" \
                       "e.g. BEV - Battery Electric Vehicle" \
                       "FCEV - Fuel Cell Electric Vehicle"

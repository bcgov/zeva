from auditable.models import Auditable
from .mixins.named import UniquelyNamed


class Make(Auditable, UniquelyNamed):
    class Meta:
        db_table = 'vehicle_make'

    db_table_comment = \
        "Brand of the vehicle" \
        "e.g. Tesla, Honda"

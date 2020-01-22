from auditable.models import Auditable
from .mixins.named import Named


class Make(Auditable, Named):
    class Meta:
        db_table = 'vehicle_make'

    db_table_comment = "Brand of the vehicle" \
                       "e.g. Tesla, Honda"

from auditable.models import Auditable
from .mixins.named import Named


class Type(Auditable, Named):
    class Meta:
        db_table = 'type'

    db_table_comment = 'Set of all vehicle Types'

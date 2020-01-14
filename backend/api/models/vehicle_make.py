from auditable.models import Auditable
from .mixins.named import Named


class Make(Auditable, Named):
    class Meta:
        db_table = 'make'

    db_table_comment = "Set of all vehicle Makes"

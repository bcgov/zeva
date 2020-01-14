from auditable.models import Auditable
from .mixins.named import UniquelyNamed
from .mixins.effective_dates import EffectiveDates


class ModelYear(Auditable, EffectiveDates, UniquelyNamed):
    class Meta:
        db_table = "model_year"

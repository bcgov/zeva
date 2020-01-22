from auditable.models import Auditable
from .mixins.named import UniquelyNamed
from .mixins.effective_dates import EffectiveDates


class ModelYear(Auditable, EffectiveDates, UniquelyNamed):
    class Meta:
        db_table = "model_year"

    db_table_comment = "A year that is used by a manufacturer as a model " \
                       "year shall " \
                       "(a) if the period of production of a model of " \
                       "vehicle or engine does not include January 1 of a " \
                       "calendar year, correspond to the calendar year " \
                       "during which the period of production falls; or " \
                       "(b) if the period of production of a model of " \
                       "vehicle or engine includes January 1 of a calendar " \
                       "year, correspond to that calendar year. " \
                       "(2) The period of production of a model of vehicle " \
                       "or engine shall include only one January 1. " \
                       "Contains unique values."

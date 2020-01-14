from django.db import models

from auditable.models import Auditable
from .credit_value import CreditValue
from .mixins.Named import UniquelyNamed, Named
from .mixins.effective_dates import EffectiveDates


class ModelYear(Auditable, EffectiveDates, UniquelyNamed):

    class Meta:
        db_table = 'model_year'


class Type(Auditable, Named):

    class Meta:
        db_table = 'type'

    db_table_comment = 'Set of all vehicle Types'


class Make(Auditable, Named):

    class Meta:
        db_table = 'make'

    db_table_comment = 'Set of all vehicle Makes'


class Model(Auditable, Named):

    class Meta:
        db_table = 'model'

    make = models.ForeignKey(
        Make,
        related_name='valid_models',
        on_delete=models.DO_NOTHING,
        null=False
    )

    db_table_comment = 'Set of all vehicle Models'


class Trim(Auditable, Named):

    class Meta:
        db_table = 'trim'

    model = models.ForeignKey(
        Model,
        related_name='valid_trims',
        on_delete=models.DO_NOTHING,
        null=False
    )

    db_table_comment = 'Set of all vehicle Trims'


class Vehicle(Auditable):

    make = models.ForeignKey(
        Make,
        related_name=None,
        on_delete=models.PROTECT
    )

    model = models.ForeignKey(
        Model,
        related_name=None,
        on_delete=models.PROTECT
    )

    trim = models.ForeignKey(
        Trim,
        related_name=None,
        on_delete=models.PROTECT
    )

    type = models.ForeignKey(
        Type,
        related_name=None,
        on_delete=models.PROTECT
    )

    range = models.IntegerField(
        db_comment='Range in km'
    )

    model_year = models.ForeignKey(
        ModelYear,
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )

    validated = models.BooleanField(default=False,
                                    db_comment='Whether this vehicle description has been validated'
                                               ' by the regulator')

    credit_value = models.OneToOneField(CreditValue, on_delete=models.CASCADE, null=True)

    class Meta:
        db_table = 'vehicle'
        unique_together = [['make', 'model', 'trim', 'model_year']]

    db_table_comment = "List of credit-generating vehicle definitions"

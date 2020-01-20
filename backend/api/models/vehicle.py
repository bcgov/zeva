from django.contrib.postgres.fields import ArrayField
from django.db import models

from enum import Enum, unique
from enumfields import EnumField

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


@unique
class VehicleDefinitionStates(Enum):
    NEW = 'NEW'
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    VALIDATED = 'VALIDATED'
    REJECTED = 'REJECTED'


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

    state = EnumField(VehicleDefinitionStates,
                      max_length=20,
                      null=False,
                      default=VehicleDefinitionStates.NEW,
                      db_comment='The review state of this vehicle. Valid states: {states}'
                      .format(states=[c.name for c in VehicleDefinitionStates]))

    credit_value = models.OneToOneField(CreditValue, on_delete=models.CASCADE, null=True)

    class Meta:
        db_table = 'vehicle'
        unique_together = [['make', 'model', 'trim', 'model_year']]

    db_table_comment = "List of credit-generating vehicle definitions"


class VehicleChangeHistory(Auditable):
    vehicle = models.ForeignKey(Vehicle, null=False, on_delete=models.CASCADE, related_name='changelog')
    actor = models.ForeignKey('UserProfile', related_name=None, on_delete=models.PROTECT, null=False,
                              db_comment='The user who changed the state')
    in_roles = ArrayField(models.CharField(max_length=50, blank=False, null=False),
                          db_comment='The roles the actor had at the moment the state changed')
    previous_state = EnumField(VehicleDefinitionStates,
                               max_length=20,
                               null=False,
                               default=VehicleDefinitionStates.NEW,
                               db_comment='The previous review state of this vehicle. Valid states: {states}'
                               .format(states=[c.name for c in VehicleDefinitionStates]))
    current_state = EnumField(VehicleDefinitionStates,
                              max_length=20,
                              null=False,
                              default=VehicleDefinitionStates.NEW,
                              db_comment='The review state of this vehicle. Valid states: {states}'
                              .format(states=[c.name for c in VehicleDefinitionStates]))


    class Meta:
        db_table = 'vehicle_change_history'

    db_table_comment = 'Record vehicle state changes'

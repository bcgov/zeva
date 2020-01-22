import django
from django.contrib.postgres.fields import ArrayField
from django.db import models

from auditable.models import Auditable
from enum import Enum, unique
from enumfields import EnumField

from auditable.models import Auditable


@unique
class VehicleDefinitionStates(Enum):
    NEW = 'NEW'
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    VALIDATED = 'VALIDATED'
    REJECTED = 'REJECTED'


class Vehicle(Auditable):
    make = models.ForeignKey(
        'Make',
        related_name=None,
        on_delete=models.PROTECT
    )

    model = models.ForeignKey(
        'Model',
        related_name=None,
        on_delete=models.PROTECT
    )

    trim = models.ForeignKey(
        'Trim',
        related_name=None,
        on_delete=models.PROTECT
    )

    type = models.ForeignKey(
        'Type',
        related_name=None,
        on_delete=models.PROTECT
    )

    range = models.IntegerField(
        db_comment='Vehicle Range in km'
    )

    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )

    is_validated = models.BooleanField(
        default=False,
        db_comment="Whether this vehicle has been an accepted ZEV "
                   "by the regulator."
    )
    state = EnumField(VehicleDefinitionStates,
                      max_length=20,
                      null=False,
                      default=VehicleDefinitionStates.NEW,
                      db_comment='The review state of this vehicle. Valid states: {states}'
                      .format(states=[c.name for c in VehicleDefinitionStates]))

    credit_value = models.OneToOneField(
        'CreditValue',
        on_delete=models.CASCADE, null=True
    )

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
    at = models.DateTimeField(default=django.utils.timezone.now,
                              db_comment='The time of the state change')

    class Meta:
        db_table = 'vehicle_change_history'

    db_table_comment = 'Record vehicle state changes'

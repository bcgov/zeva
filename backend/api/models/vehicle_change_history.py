import django
from django.contrib.postgres.fields import ArrayField
from django.db import models

from auditable.models import Commentable
from enumfields import EnumField
from .vehicle_statuses import VehicleDefinitionStatuses


class VehicleChangeHistory(Commentable):
    make = models.ForeignKey(
        'Make',
        null=True,
        related_name=None,
        on_delete=models.PROTECT
    )
    vehicle_class_code = models.ForeignKey(
        'VehicleClass',
        null=True,
        related_name=None,
        on_delete=models.PROTECT
    )
    vehicle_fuel_type = models.ForeignKey(
        'FuelType',
        null=True,
        related_name=None,
        on_delete=models.PROTECT
    )
    range = models.IntegerField(
        db_comment='Vehicle Range in km',
        null=True
    )
    model_name = models.CharField(
        blank=True,
        db_comment="Model and trim of vehicle",
        max_length=250,
        null=True
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=True
    )
    validation_status = EnumField(
        VehicleDefinitionStatuses,
        max_length=20,
        null=True,
        default=VehicleDefinitionStatuses.NEW,
        db_comment="The validation status of the vehicle. Valid statuses: "
                   "{statuses}".format(
                        statuses=[c.name for c in VehicleDefinitionStatuses]
                   )
    )
    vehicle = models.ForeignKey(
        'Vehicle',
        null=True,
        on_delete=models.CASCADE,
        related_name='history'
    )
    in_roles = ArrayField(
        models.CharField(
            max_length=50,
            blank=False,
            null=True
        ),
        db_comment='The roles the actor had at the moment the status changed'
    )

    class Meta:
        db_table = 'vehicle_change_history'

    db_table_comment = \
        "Keeps track of the changes done on the vehicle table." \
        "Each row should contain the last known values of the vehicle row, " \
        "before it's updated or created."

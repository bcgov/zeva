import django
from django.contrib.postgres.fields import ArrayField
from django.db import models

from auditable.models import Auditable
from enumfields import EnumField
from .vehicle_statuses import VehicleDefinitionStatuses


class Vehicle(Auditable):
    make = models.ForeignKey(
        'Make',
        related_name=None,
        on_delete=models.PROTECT
    )
    vehicle_class_code = models.ForeignKey(
        'VehicleClass',
        related_name=None,
        on_delete=models.PROTECT
    )
    vehicle_fuel_type = models.ForeignKey(
        'FuelType',
        related_name=None,
        on_delete=models.PROTECT
    )
    range = models.IntegerField(
        db_comment='Vehicle Range in km'
    )
    model_name = models.CharField(
        blank=False,
        db_comment="Model and trim of vehicle",
        max_length=250,
        null=False
    )
    model_year = models.ForeignKey(
        'ModelYear',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    validation_status = EnumField(
        VehicleDefinitionStatuses,
        max_length=20,
        null=False,
        default=VehicleDefinitionStates.DRAFT,
        db_comment="The validation status of the vehicle. Valid statuses: "
                   "{statuses}".format(
                        statuses=[c.name for c in VehicleDefinitionStatuses]
                   )
    )

    class Meta:
        db_table = 'vehicle'
        unique_together = [[
            'make', 'model_name', 'vehicle_class_code', 'vehicle_fuel_type',
            'model_year'
        ]]

    db_table_comment = "List of credit-generating vehicle definitions"

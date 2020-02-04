import django
from django.contrib.postgres.fields import ArrayField
from django.db import models

from auditable.models import Commentable
from enumfields import EnumField
from .vehicle_statuses import VehicleDefinitionStatuses


class VehicleChangeHistory(Commentable):
    make_id = models.IntegerField(
        db_comment="ID referencing the vehicle_make table",
        null=True
    )
    vehicle_class_code_id = models.IntegerField(
        db_comment="ID referencing the vehicle_class_code table",
        null=True
    )
    vehicle_fuel_type_id = models.IntegerField(
        db_comment="ID referencing the vehicle_class_code table",
        null=True
    )
    range = models.IntegerField(
        db_comment="Vehicle Range in km",
        null=True
    )
    model_name = models.CharField(
        blank=True,
        db_comment="Model and trim of vehicle",
        max_length=250,
        null=True
    )
    model_year_id = models.IntegerField(
        db_comment="ID referencing the model_year table",
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
    user_role = ArrayField(
        models.CharField(
            max_length=50,
            blank=False,
            null=True
        ),
        null=True,
        db_comment="The role (or roles) assigned to the user at the time they "
                   "made a change to a vehicle record. Role values are "
                   "generated from Keycloak and are stored in a "
                   "comma-delimited string."
    )

    class Meta:
        db_table = 'vehicle_change_history'

    db_table_comment = \
        "Keeps track of the changes done on the vehicle table." \
        "Each row should contain the last known values of the vehicle row, " \
        "before it's updated or created."

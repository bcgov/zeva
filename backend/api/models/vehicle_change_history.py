import django
from django.contrib.postgres.fields import ArrayField
from django.db import models

from auditable.models import Commentable
from enumfields import EnumField
from .vehicle_statuses import VehicleDefinitionStatuses


class VehicleChangeHistory(Commentable):
    create_timestamp = models.DateTimeField(
        auto_now_add=True,
        blank=True,
        null=True,
        db_comment='When the change was made'
    )
    create_user = models.ForeignKey(
        'UserProfile',
        related_name='history',
        blank=True, null=True,
        on_delete=models.CASCADE,
        db_comment='User who made the change to the record'
    )
    vehicle_zev_type_id = models.IntegerField(
        db_comment="ID referencing the vehicle_zev_type table"
    )
    range = models.IntegerField(
        db_comment="Vehicle Range in km"
    )
    make = models.CharField(
        blank=True,
        db_comment="Make of vehicle",
        max_length=250,
        null=True
    )
    model_name = models.CharField(
        blank=True,
        db_comment="Model and trim of vehicle",
        max_length=250,
        null=True
    )
    model_year_id = models.IntegerField(
        db_comment="ID referencing the model_year table"
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

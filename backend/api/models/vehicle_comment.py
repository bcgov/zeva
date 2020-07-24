"""
Vehicle Comment Model
"""
from django.db import models

from auditable.models import Auditable


class VehicleComment(Auditable):
    """
    Contains comments made about the vehicle such as requesting range test
    results from the supplier.
    """
    vehicle = models.ForeignKey(
        'Vehicle',
        related_name='vehicle_comments',
        null=False,
        on_delete=models.PROTECT
    )
    comment = models.CharField(
        max_length=4000,
        blank=True,
        null=True,
        db_column='vehicle_comment',
        db_comment="Comment left by idir user about vehicle"
    )

    class Meta:
        db_table = 'vehicle_comment'
        ordering = ['create_timestamp']

    db_table_comment = \
        "Contains comments made about the vehicle such as requesting " \
        "range test results from the supplier."

from django.db import models

from auditable.models import Auditable


class VehicleMakeOrganization(Auditable):
    """
    Contains the relationship between the suppliers and the make
    (which vehicle makes do the suppliers sell)
    """
    vehicle_make = models.ForeignKey(
        'Make',
        related_name='vehicle_make_organizations',
        on_delete=models.CASCADE
    )
    organization = models.ForeignKey(
        'Organization',
        related_name='vehicle_make_organizations',
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'vehicle_make_organization'

    db_table_comment = \
        "Contains the relationship between the make and organizations table." \
        "(ie which makes do suppliers sell)"

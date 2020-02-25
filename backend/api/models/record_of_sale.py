from api.models.record_of_sale_statuses import RecordOfSaleStatuses
from api.models.vin_statuses import VINStatuses
from auditable.models import Auditable
from django.db import models
from enumfields import EnumField


class RecordOfSale(Auditable):
    organization = models.ForeignKey(
        'Organization',
        related_name='sales',
        on_delete=models.CASCADE
    )

    vehicle = models.ForeignKey(
        'Vehicle',
        related_name='sales',
        on_delete=models.CASCADE
    )

    sale_id = models.CharField(blank=True,
                               null=True,
                               max_length=255,
                               db_comment="An (optional) vehicle-supplier-provided correlation ID")

    vin = models.CharField(blank=True,
                           null=True,
                           max_length=20,
                           db_comment="A Vehicle Identification Number, a standard 17-character identifier "
                                      " used in the automative industry to identify origin, colour, style, serial"
                                      " number, and other attributes (encoding is manufacturer-specific)")

    vin_validation_status = EnumField(
        VINStatuses,
        max_length=30,
        null=False,
        default=VINStatuses.UNCHECKED,
        db_comment="The validation status of the VIN. Valid statuses: "
                   "{statuses}".format(
            statuses=[c.name for c in VINStatuses]
        )
    )

    sale_date = models.DateField(blank=True,
                                 null=True,
                                 db_comment="The calendar date the vehicle was placed with an end customer")

    submission_date = models.DateField(
        blank=True,
        null=True,
        auto_now=True,
        db_comment="The calendar date the submission was entered in ZEVA"
    )

    validation_status = EnumField(
        RecordOfSaleStatuses,
        max_length=20,
        null=False,
        default=VINStatuses.UNCHECKED,
        db_comment="The validation status of this record of sale. Valid statuses: "
                   "{statuses}".format(
            statuses=[c.name for c in RecordOfSaleStatuses]
        )
    )

    # @todo we don't have a transaction table yet, but this should hold a reference to any credit transaction created
    # transaction = models.ForeignKey(
    #         'CreditTransaction',
    #         related_name='sale',
    #         on_delete=models.PROTECT,
    #         null=True,
    #     )

    class Meta:
        db_table = "record_of_sale"
        unique_together = [['organization', 'sale_id']]

    db_table_comment = 'Hold individual records of sale submitted by ZEV suppliers, including their VIN, ' \
                       'sales dates, and the workflow state information for this sale (VIN and record validation ' \
                       'statuses)'

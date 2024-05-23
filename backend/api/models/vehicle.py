from django.db import models
from enumfields import EnumField
from django.db.models import Q
from auditable.models import Auditable
from .vehicle_statuses import VehicleDefinitionStatuses


class Vehicle(Auditable):
    make = models.CharField(
        blank=False,
        db_comment="The make of vehicle"
                   "eg Toyota, Honda, Mitsubishi",
        null=False,
        max_length=250
    )
    vehicle_zev_type = models.ForeignKey(
        'ZevType',
        related_name=None,
        on_delete=models.PROTECT
    )
    vehicle_class_code = models.ForeignKey(
        'VehicleClass',
        related_name=None,
        on_delete=models.PROTECT
    )
    range = models.IntegerField(
        db_comment='Vehicle Range in km'
    )
    model_name = models.CharField(
        blank=False,
        db_comment="Model information of the vehicle",
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
        default=VehicleDefinitionStatuses.DRAFT,
        db_comment="The validation status of the vehicle. Valid statuses: "
                   "{statuses}".format(
                       statuses=[c.name for c in VehicleDefinitionStatuses]
                   )
    )
    organization = models.ForeignKey(
        'Organization',
        related_name=None,
        on_delete=models.PROTECT,
        null=False
    )
    weight_kg = models.DecimalField(
        blank=False,
        db_comment="Weight of vehicle",
        max_digits=6,
        decimal_places=0
    )
    credit_class = models.ForeignKey(
        'CreditClass',
        related_name='+',
        on_delete=models.PROTECT,
        null=True
    )
    has_passed_us_06_test = models.BooleanField(
        default=False,
        db_comment="Boolean field used to claim whether the vehicle should "
                   "get additional credit for passing the US06 range test."
    )
    credit_value = models.DecimalField(
        null=True,
        decimal_places=2,
        max_digits=20,
        db_comment="The number of credits (of credit_class) a sale of this "
                   "vehicle can generate"
    )
    is_active = models.BooleanField(
        default=True,
        db_comment="Boolean field used to determine whether a vehicle is "
                   "active or inactive"
    )

    def get_credit_class(self):
        """
        Gets the credit class of the vehicle
        """
        if self.vehicle_zev_type.vehicle_zev_code in ['BEV', 'FCEV'] and \
                self.range < 80.47:
            return 'C'

        if self.vehicle_zev_type.vehicle_zev_code not in ['BEV', 'FCEV'] and \
                self.range < 16:
            return 'C'

        if self.vehicle_zev_type.vehicle_zev_code == 'EREV' and \
                self.range >= 121:
            return 'A'

        if self.vehicle_zev_type.vehicle_zev_code in ['BEV', 'FCEV']:
            return 'A'

        return 'B'

    def get_credit_value(self):
        """
        Gets the credit value of the vehicle
        """
        credit_class = self.get_credit_class()
        if credit_class == 'C':
            return 0

        if credit_class == 'A':
            credit = (self.range * 0.006214) + 0.5

            if credit > 4:
                credit = 4

        if credit_class == 'B':
            credit = (self.range * 0.006214) + 0.3

            if self.vehicle_zev_type.vehicle_zev_code in ['EREV', 'PHEV'] and \
                self.has_passed_us_06_test is True:
                credit += 0.2

            if not self.has_passed_us_06_test and credit > 1.1:
                credit = 1.1
            elif self.has_passed_us_06_test and credit > 1.3:
                credit = 1.3

        return round(credit, 2)

    class Meta: 
        db_table = "vehicle" 
        constraints = [ 
            models.UniqueConstraint( 
                fields=["make", "model_name", "vehicle_zev_type", "model_year"], 
                condition=~Q(validation_status="DELETED"), 
                name="unique_non_deleted_vehicles", 
            )] 

    db_table_comment = "List of credit-generating vehicle definitions"

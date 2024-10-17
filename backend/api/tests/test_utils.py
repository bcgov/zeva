from collections import namedtuple
from django.utils import timezone
from ..models.credit_class import CreditClass
from ..models.credit_transaction import CreditTransaction
from ..models.credit_transaction_type import CreditTransactionType
from ..models.organization_deficits import OrganizationDeficits
from ..models.vehicle import Vehicle
from ..models.vehicle_class import VehicleClass
from ..models.vehicle_zev_type import ZevType
from ..models.weight_class import WeightClass


def give_org_credits(org_to_receive_credits, amount, credit_value, model_year, credit_class):
        """ give org  some credits so they always have enough for the transfer """
        return CreditTransaction.objects.create(
            credit_to=org_to_receive_credits,
            model_year=model_year,
            credit_class=credit_class,
            weight_class=WeightClass.objects.get(weight_class_code='LDV'),
            credit_value=credit_value,
            number_of_credits=amount,
            total_value=amount*credit_value,
            transaction_type=CreditTransactionType.objects.get(
                transaction_type="Validation"),
            transaction_timestamp=timezone.now()
        )

def create_deficit(org, credit_class,  model_year):
    OrganizationDeficits.objects.create(
        organization_id=org.id,
        credit_value=50,
        credit_class=credit_class,
        model_year=model_year,
        create_user="test",
        update_timestamp=timezone.now(),
    )
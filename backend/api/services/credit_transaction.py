"""
Helper Functions for Credit Transactions
"""
from django.db.models import Count
from api.models.credit_transaction import CreditTransaction
from api.models.record_of_sale import RecordOfSale
from api.models.vehicle import Vehicle


def award_credits(submission):
    """
    Adds credits to the vehicle supplier based on their sales submission
    Only validated records will be used for the calculation of credits
    """
    records = RecordOfSale.objects.filter(
        submission_id=submission.id,
        validation_status="VALIDATED",
    ).values('vehicle_id').annotate(total=Count('id')).order_by('vehicle_id')

    for record in records:
        vehicle = Vehicle.objects.get(id=record.get('vehicle_id'))
        credit_value = record.get('total') * vehicle.get_credit_value()
        credit_class = vehicle.get_credit_class()

        if credit_class in ['A', 'B']:
            CreditTransaction.objects.create(
                create_user=submission.update_user,
                credit_class_id=credit_class,
                credit_to=submission.organization,
                credit_value=credit_value,
                update_user=submission.update_user,
                transaction_type_id="Validation",
                vehicle_id=vehicle.id
            )

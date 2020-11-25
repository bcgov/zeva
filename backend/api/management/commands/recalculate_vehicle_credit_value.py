from django.core.management import BaseCommand

from api.models.credit_class import CreditClass
from api.models.vehicle import Vehicle


class Command(BaseCommand):
    help = 'Recalculate credit classes and credit values for each vehicle. ' \
           'In case, previous values were calculated correctly.'

    def handle(self, *args, **options):
        vehicles = Vehicle.objects.filter(
            validation_status='VALIDATED'
        )

        for vehicle in vehicles:
            vehicle.credit_class = CreditClass.objects.filter(
                credit_class=vehicle.get_credit_class()
            ).first()
            vehicle.credit_value = vehicle.get_credit_value()
            vehicle.save()

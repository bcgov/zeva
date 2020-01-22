from datetime import timedelta, datetime
import random

from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.credit_value import CreditValue
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle
from api.models.vehicle_make import Make
from api.models.vehicle_model import Model
from api.models.vehicle_trim import Trim
from api.models.vehicle_type import Type


class AddSampleVehicles(OperationalDataScript):
    """
    Adds a couple of vehicles as sample data
    """
    is_revertable = False
    comment = 'Adds Sample Vehicles'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):

        my2020 = ModelYear.objects.create(name='2020',
                                          effective_date=datetime(2020, 1, 1),
                                          expiration_date=datetime(2020, 12, 31))

        make_names = ['Homemade', 'Organic']
        model_names = ['Canyonero', 'Delorean', 'Optimus Prime', 'Scooty Puff Jr.', 'Thundercougarfalconbird']
        trims = ['Basic', 'Fancy', 'Super Fancy']
        types = ['Battery Electric', 'Plugin Hybrid', 'Hydrogen Fuel Cell', 'Mr. Fusion']

        created_tuples = []

        for make in make_names:
            make_ref = Make.objects.create(name=make)
            for model in model_names:
                model_ref = Model.objects.create(name=model, make=make_ref)
                for trim in trims:
                    trim_ref = Trim.objects.create(name=trim, model=model_ref)
                    created_tuples.append((make_ref, model_ref, trim_ref))

        created_types = []

        for type in types:
            created_types.append(Type.objects.create(name=type))

        random.shuffle(created_tuples)

        for i in range(0, 20):
            v = created_tuples.pop()

            credit_roll = [lambda: None,
                           lambda: CreditValue.objects.create(class_a_credit_value=random.random()*100),
                           lambda: CreditValue.objects.create(class_b_credit_value=random.random()*100)]

            Vehicle.objects.create(
                type=random.choice(created_types),
                make=v[0],
                model=v[1],
                trim=v[2],
                range=50 + (random.random() * 1000),
                model_year=my2020,
                credit_value=random.choice(credit_roll)()
            )


script_class = AddSampleVehicles

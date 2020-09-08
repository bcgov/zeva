from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.address_type import AddressType


class AddAddressTypes(OperationalDataScript):
    """
    Adds the address types: Records address and Service address
    """
    is_revertable = False
    comment = 'Adds the address types: Records address and Service address'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        AddressType.objects.get_or_create(
            address_type='Records',
            defaults={
                'effective_date': "2018-01-01"
            }
        )
        AddressType.objects.get_or_create(
            address_type='Service',
            defaults={
                'effective_date': "2018-01-01"
            }
        )


script_class = AddAddressTypes

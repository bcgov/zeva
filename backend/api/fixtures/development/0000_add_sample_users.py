from django.db import transaction	

from api.management.data_script import OperationalDataScript	
from api.models.organization import Organization	
from api.models.organization_address import OrganizationAddress	
from api.models.user_profile import UserProfile	


class AddSampleUsers(OperationalDataScript):	
    """	
    Adds a couple of users as sample data	
    """	
    is_revertable = False	
    comment = 'Adds Sample Users'	

    def check_run_preconditions(self):	
        return True	

    @transaction.atomic	
    def run(self):	

        suzuki = Organization.objects.get(	
            name="Suzuki"	
        )	

        tesla = Organization.objects.get(	
            name="Tesla Motors Canada ULC"	
        )	

        gov = Organization.objects.get(	
            name="Government of British Columbia"	
        )	

        vs1 = UserProfile.objects.create(username='fs1', is_active=True, organization=suzuki)	
        vs2 = UserProfile.objects.create(username='fs2', is_active=True, organization=tesla)	
        analyst = UserProfile.objects.create(username='analyst', is_active=True, organization=gov)	


script_class = AddSampleUsers	

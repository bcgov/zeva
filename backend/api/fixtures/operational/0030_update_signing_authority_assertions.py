from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.signing_authority_assertion import SigningAuthorityAssertion


class UpdateSigningAuthorityAssertions(OperationalDataScript):
    """
    Update the assertions for the compliance report
    """
    is_revertable = False
    comment = 'Update the assertions for the compliance report'

    def check_run_preconditions(self):
        return True

    def update_assertions(self):
        text = "I confirm this consumer ZEV sales information is complete and correct."
        assertion = SigningAuthorityAssertion.objects.get(
            module="consumer_sales")
        assertion.description = text
        assertion.save()

    @transaction.atomic
    def run(self):
        self.update_assertions()


script_class = UpdateSigningAuthorityAssertions

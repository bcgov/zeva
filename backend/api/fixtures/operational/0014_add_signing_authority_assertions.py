from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.signing_authority_assertion import SigningAuthorityAssertion


class AddSigningAuthorityAssertions(OperationalDataScript):
    """
    Adds the assertions for the credit transfers
    """
    is_revertable = False
    comment = 'Adds the assertions for the credit transfers'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        SigningAuthorityAssertion.objects.get_or_create(
            description="I confirm that I am an officer or employee of "
                        "{user.organization.name}, and that records "
                        "evidencing my authority to submit this notice "
                        "are available on request.",
            display_order="1",
            effective_date="2020-01-01"
        )
        SigningAuthorityAssertion.objects.get_or_create(
            description="{user.organization.name} certifies that the "
                        "information provided in this notice is accurate "
                        "and complete.",
            display_order="2",
            effective_date="2020-01-01"
        )
        SigningAuthorityAssertion.objects.get_or_create(
            description="{user.organization.name} consents to the transfer "
                        "of credits in this notice.",
            display_order="3",
            effective_date="2020-01-01"
        )


script_class = AddSigningAuthorityAssertions

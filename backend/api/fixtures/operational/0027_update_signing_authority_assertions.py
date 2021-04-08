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

    def delete_assertions(self):
        assertions_to_be_deleted = [
            'consumer_sales',
            'compliance_obligation',
        ]
        SigningAuthorityAssertion.objects.filter(
            module__in=assertions_to_be_deleted
        ).delete()

    def add_assertions(self):
        SigningAuthorityAssertion.objects.get_or_create(
            description="I confirm this consumer sales information is "
                        "complete and correct.",
            display_order="5",
            effective_date="2020-01-01",
            module="consumer_sales"
        )
        SigningAuthorityAssertion.objects.get_or_create(
            description="I confirm this compliance obligation "
                        "information is complete and correct.",
            display_order="6",
            effective_date="2020-01-01",
            module="compliance_obligation"
        )
        SigningAuthorityAssertion.objects.get_or_create(
            description="On behalf of {user.organization.name}, "
                        "I confirm the information included in this "
                        "Model Year report is complete and accurate.",
            display_order="7",
            effective_date="2020-01-01",
            module="compliance_summary"
        )

    def update_assertions(self):
        text = "I confirm this supplier information is complete and correct."
        assertion = SigningAuthorityAssertion.objects.get(
            module="supplier_information")
        assertion.description = text
        assertion.save()

    @transaction.atomic
    def run(self):
        self.delete_assertions()
        self.add_assertions()
        self.update_assertions()


script_class = UpdateSigningAuthorityAssertions

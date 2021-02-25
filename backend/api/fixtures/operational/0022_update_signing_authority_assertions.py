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

    @transaction.atomic
    def run(self):
        SigningAuthorityAssertion.objects.get_or_create(
            description="I confirm the legal name, address for service, "
                        "records address, the supplier classification "
                        "and vehicle makes supplier are correct.",
            display_order="4",
            effective_date="2020-01-01",
            module="supplier_information"
        )
        SigningAuthorityAssertion.objects.get_or_create(
            description="I confirm the consumer sales figures are correct.",
            display_order="5",
            effective_date="2020-01-01",
            module="consumer_sales"
        )
        SigningAuthorityAssertion.objects.get_or_create(
            description="I confirm the model year, type and range of each ZEV "
                        "model sold or leased are correct.",
            display_order="6",
            effective_date="2020-01-01",
            module="consumer_sales"
        )
        SigningAuthorityAssertion.objects.get_or_create(
            description="I confirm the credit balances are correct",
            display_order="7",
            effective_date="2020-01-01",
            module="compliance_obligation"
        )
        SigningAuthorityAssertion.objects.get_or_create(
            description="I confirm the number, model year, vehicle class "
                        "and ZEV class of credits issued, transfered or added are correct.",
            display_order="8",
            effective_date="2020-01-01",
            module="compliance_obligation"
        )
        SigningAuthorityAssertion.objects.get_or_create(
            description="I confirm the number, vehicle class "
                        "and ZEV class of credits debited are correct.",
            display_order="9",
            effective_date="2020-01-01",
            module="compliance_obligation"
        )


script_class = UpdateSigningAuthorityAssertions

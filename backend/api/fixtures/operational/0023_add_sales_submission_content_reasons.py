from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.sales_submission_content_reason import \
    SalesSubmissionContentReason


class AddSalesSubmissionContentReasons(OperationalDataScript):
    """
    Adds the possible reasons for overriding icbc data
    """
    is_revertable = False
    comment = 'Adds the possible reasons for overriding icbc data'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        SalesSubmissionContentReason.objects.get_or_create(
            reason="Evidence provided"
        )
        SalesSubmissionContentReason.objects.get_or_create(
            reason="Validated by other means as being registered in BC"
        )
        SalesSubmissionContentReason.objects.get_or_create(
            reason="Error in ICBC data"
        )
        SalesSubmissionContentReason.objects.get_or_create(
            reason="VIN decoder, confirmed a ZEV"
        )
        SalesSubmissionContentReason.objects.get_or_create(
            reason="VIN decoder, not a ZEV"
        )
        SalesSubmissionContentReason.objects.get_or_create(
            reason="Other, explained in comments"
        )


script_class = AddSalesSubmissionContentReasons

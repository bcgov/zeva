from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year_report_assessment_descriptions import ModelYearReportAssessmentDescriptions


class AddAssessmentDescriptions(OperationalDataScript):
    """
    Adds the descriptions that will show up as radio options on the assessment 
    page for idir users to select before recommending assessment
    """
    is_revertable = False
    comment = 'Adds the vehicle makes found in the NRCAN document'

    def check_run_preconditions(self):
        return True

    @transaction.atomic
    def run(self):
        ModelYearReportAssessmentDescriptions.objects.create(
            description="{user.organization.name} has complied with section 10 (2) of the Zero-Emission Vehicles Act for the {modelYear} adjustment period.",
            display_order=0
        )
        ModelYearReportAssessmentDescriptions.objects.create(
            description="Section 10 (3) does not apply as {user.organization.name} did not have a balance at the end of the compliance date for the previous model year that contained less than zero ZEV units of the same vehicle class and any ZEV class.",
            display_order=1
        )
        ModelYearReportAssessmentDescriptions.objects.create(
            description="Section 10 (3) applies and {user.organization.name}​​​​​​​ is subject to an automatic administrative penalty As per section 26 of the Act the amount of the administrative penalty is:",
            display_order=2
 
        )


script_class = AddAssessmentDescriptions

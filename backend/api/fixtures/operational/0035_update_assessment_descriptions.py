from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.model_year_report_assessment_descriptions import ModelYearReportAssessmentDescriptions


class UpdateAssessmentDecriptions(OperationalDataScript):
    """
    Update the assessment descriptions for the model year report
    """
    is_revertable = False
    comment = 'Update the descriptions for the model year report asssesment'

    def check_run_preconditions(self):
        return True

    def update_descriptions(self):
        text = "{user.organization.name} has complied with section 10 (2) of the Zero-Emission Vehicles Act for the {modelYear} model year."
        assessment = ModelYearReportAssessmentDescriptions.objects.get(
            display_order=0)
        assessment.description = text
        assessment.save()
        text = "{user.organization.name} has not complied with section 10 (2) of the Zero-Emission Vehicles Act for the {modelYear} model year. Section 10 (3) does not apply as {user.organization.name} did not have a balance at the end of the compliance date for the previous model year that contained less than zero ZEV units of the same vehicle class and any ZEV class."
        assessment = ModelYearReportAssessmentDescriptions.objects.get(
            display_order=1)
        assessment.description = text
        assessment.save()
        text = "{user.organization.name} ​​​​​​​has not complied with section 10 (2) of the Zero-Emission Vehicles Act for the {modelYear} model year. ​​Section 10 (3) applies and {user.organization.name} is subject to an automatic administrative penalty of {penalty}, as determined under section 26 of the Act. {user.organization.name} is required to pay the administrative penalty within the time period set out in in section 28 of the Act."
        assessment = ModelYearReportAssessmentDescriptions.objects.get(
            display_order=2)
        assessment.description = text
        assessment.save()

    @transaction.atomic
    def run(self):
        self.update_descriptions()


script_class = UpdateAssessmentDecriptions

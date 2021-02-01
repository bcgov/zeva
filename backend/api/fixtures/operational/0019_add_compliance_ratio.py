from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.compliance_ratio import ComplianceRatio
from api.authorities import REQUIRED_AUTHORITIES


class AddComplianceRatio(OperationalDataScript):
    """
    Adds the Compliance Ratios
    """
    is_revertable = False
    comment = 'Add the Compliance Ratios'

    def check_run_preconditions(self):
        return True

    def add_comliance_ratio(self):
        ComplianceRatio.objects.get_or_create(
            model_year='2019',
            compliance_ratio='0%',
            zev_class_a='0%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2020',
            compliance_ratio='9.5%',
            zev_class_a='6%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2021',
            compliance_ratio='12%',
            zev_class_a='8%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2022',
            compliance_ratio='14.5%',
            zev_class_a='10%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2023',
            compliance_ratio='17%',
            zev_class_a='12%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2024',
            compliance_ratio='19.5%',
            zev_class_a='14%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2025',
            compliance_ratio='22%',
            zev_class_a='16%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2026',
            compliance_ratio='32%',
            zev_class_a='23%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2027',
            compliance_ratio='41.5%',
            zev_class_a='29%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2028',
            compliance_ratio='51.5%',
            zev_class_a='36%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2029',
            compliance_ratio='61%',
            zev_class_a='43%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2030',
            compliance_ratio='71%',
            zev_class_a='50%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2031',
            compliance_ratio='90%',
            zev_class_a='63%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2032',
            compliance_ratio='108.5%',
            zev_class_a='77%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2033',
            compliance_ratio='127.5%',
            zev_class_a='90%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2034',
            compliance_ratio='146%',
            zev_class_a='104%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2035',
            compliance_ratio='165%',
            zev_class_a='117%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2036',
            compliance_ratio='184%',
            zev_class_a='130%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2037',
            compliance_ratio='203%',
            zev_class_a='144%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2038',
            compliance_ratio='221.5%',
            zev_class_a='157%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2039',
            compliance_ratio='240.5%',
            zev_class_a='171%'
        )
        ComplianceRatio.objects.get_or_create(
            model_year='2040',
            compliance_ratio='259%',
            zev_class_a='181%'
        )


    @transaction.atomic
    def run(self):
        self.add_comliance_ratio()

        print('Added Compliance Ratios')


script_class = AddComplianceRatio

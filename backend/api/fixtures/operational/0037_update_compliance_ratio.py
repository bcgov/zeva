from django.db import transaction
from api.management.data_script import OperationalDataScript
from api.models.compliance_ratio import ComplianceRatio

class UpdateComplianceRatio(OperationalDataScript):
    """
    Update compliance ratios to match document
    ZEV Reporting System: Compliance Ratio Changes – October 1, 2024 
    """
    is_revertable = False
    comment = 'Update compliance ratios'

    def check_run_preconditions(self):
        return True

    def update_compliance_ratio(self):
        """
        Update compliance ratios based on predefined values.
        """
        ratios = [
            (2026, 26.30, 15.20),
            (2027, 42.60, 28.70),
            (2028, 58.90, 43.20),
            (2029, 74.80, 58.00),
            (2030, 91.00, 73.30),
            (2031, 93.20, 77.20),
            (2032, 95.20, 80.60),
            (2033, 97.20, 83.70),
            (2034, 99.30, 86.70),
            (2035, 100.00, 89.50),
        ]
        
        for year, ratio, zev_class_a in ratios:
            compliance_ratio = ComplianceRatio.objects.get(model_year=year)
            compliance_ratio.compliance_ratio = ratio
            compliance_ratio.zev_class_a = zev_class_a
            compliance_ratio.save()

    def delete_compliance_ratio(self):
        """
        Delete compliance ratios for model years greater than or equal to 2036.
        """
        ComplianceRatio.objects.filter(model_year__gte=2036).delete()

    @transaction.atomic
    def run(self):
        self.update_compliance_ratio()
        self.delete_compliance_ratio()

script_class = UpdateComplianceRatio
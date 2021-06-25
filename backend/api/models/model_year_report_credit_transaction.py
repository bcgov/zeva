from django.db import models

from auditable.models import Auditable


class ModelYearReportCreditTransaction(Auditable):
    """
    Contains the relationship between the model year report and
    credit transactions table.
    """
    model_year_report = models.ForeignKey(
        'ModelYearReport',
        related_name='model_year_report_credit_transaction',
        on_delete=models.CASCADE
    )
    credit_transaction = models.ForeignKey(
        'CreditTransaction',
        related_name='model_year_report_credit_transaction',
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'model_year_report_credit_transaction'

    db_table_comment = \
        "Contains the relationship between the model year report and " \
        "credit transactions table."

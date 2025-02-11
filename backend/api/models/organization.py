from datetime import date
from django.db import models
from django.db.models import F

from auditable.models import Auditable
from .credit_class import CreditClass
from .organization_address import OrganizationAddress
from .organization_deficits import OrganizationDeficits
from .organization_ldv_sales import OrganizationLDVSales
from .model_year_report import ModelYearReport
from .model_year_report_statuses import ModelYearReportStatuses
from .user_profile import UserProfile
from ..managers.organization import OrganizationManager
from ..services.credit_transaction import aggregate_credit_balance_details
from api.models.model_year import ModelYear

class Organization(Auditable):
    name = models.CharField(
        db_column="organization_name",
        db_comment="Name of the organization",
        max_length=500,
        null=False,
        unique=True
    )

    short_name = models.CharField(
        db_column='short_name',
        db_comment='Short version of the organization name, used in generating some reports',
        unique=True,
        null=True,
        max_length=64
    )

    is_active = models.BooleanField(
        default=False,
        db_comment="Boolean Field to see if the organization is disabled "
                   "or not."
    )
    is_government = models.BooleanField(
        default=False,
        db_comment="Flag to check whether this is the Government organization"
    )

    first_model_year = models.ForeignKey(
        'ModelYear',
        related_name='+',
        on_delete=models.PROTECT,
        null=True,
        default=ModelYear.get_default_first_model_year_id_for_organization
    )

    @property
    def balance(self):
        """
        Gets the class A and B balance for the current
        organization
        """
        aggregate_transactions = aggregate_credit_balance_details(self.id)
        org_total = {'A': 0, 'B': 0}

        for each in aggregate_transactions:
            credit_class = CreditClass.objects.filter(id=each['credit_class_id']).first()
            org_total[credit_class.credit_class] += each['total_value']

        return org_total

    @property
    def members(self):
        """
        Gets the list of user for the current organization
        """
        data = UserProfile.objects.filter(
            organization_id=self.id
        ).order_by(
            'display_name', 'first_name', 'last_name'
        )

        return data

    @property
    def organization_address(self):
        """
        Gets the active address for the organization
        """
        data = OrganizationAddress.objects.filter(
            effective_date__lte=date.today(),
            organization_id=self.id
        ).exclude(
            expiration_date__lte=date.today()
        ).exclude(
            expiration_date=F('effective_date')
        ).order_by('-effective_date', '-update_timestamp')

        return data

    @property
    def has_submitted_report(self):
        reports = ModelYearReport.objects.filter(
            organization_id=self.id,
            validation_status__in=[
                ModelYearReportStatuses.SUBMITTED,
                ModelYearReportStatuses.RECOMMENDED,
                ModelYearReportStatuses.ASSESSED,
            ]
        )

        if reports.count() > 0:
            return True

        return False
    
    @property
    def has_report(self):
        return ModelYearReport.objects.filter(organization_id=self.id).exists()

    @property
    def ldv_sales(self):
        sales = OrganizationLDVSales.objects.filter(
            organization_id=self.id
        ).order_by('-model_year__name')

        return sales

    def get_ldv_sales(self, year):
        is_supplied = False if year < 2024 else True
        sales = self.ldv_sales.filter(
            model_year__name__in=[
                str(year - 1),
                str(year - 2),
                str(year - 3)
            ]
        ).filter(is_supplied=is_supplied)
        return sales
    
    def filter_sales_supplied(self, year, is_supplied):
        return self.ldv_sales.filter(
            model_year__name__lte=year
        ).filter(is_supplied=is_supplied).values_list(
            'ldv_sales', flat=True
        )
    
    def get_avg_ldv_sales(self, year=None):
        if not year:
            year = date.today().year

            if date.today().month < 10:
                year -= 1
        is_supplied = False if year < 2024 else True
        
        sales = self.filter_sales_supplied(year, is_supplied)[:3]
    
        if is_supplied == True and sales.count() < 3:
            is_supplied = False
            # If there aren't enough Supplied values, show 'Sales' average
            sales = self.filter_sales_supplied(year, is_supplied)[:3]
            if sales.count() < 3:
                # if there are less than 3 supplied or sales, show the 1 
                # most recent supplied
                is_supplied = True
                sales = self.filter_sales_supplied(year, is_supplied)[:1]

            if not sales:
                return None, None

        sales_or_supplied = 'Supplied' if is_supplied else 'Sales'
        
        return sum(list(sales)) / len(sales), sales_or_supplied

    def get_current_class(self, year=None, avg_sales=None):
        # The logic below means that if we're past october, the past year
        # should count the current yer
        if not year:
            year = date.today().year

            if date.today().month < 10:
                year -= 1

        if not avg_sales:
            result = self.get_avg_ldv_sales(year)
            avg_sales, _ = result
        if not avg_sales:
            avg_sales = 0

        if avg_sales < 1000:
            return 'S'
        if avg_sales >= 5000:
            return 'L'

        return 'M'

    @property
    def supplier_class(self):
        return self.get_current_class()

    @property
    def deficits(self):
        records = OrganizationDeficits.objects.filter(
            organization_id=self.id
        ).order_by('model_year__name')

        return records

    class Meta:
        db_table = 'organization'

    objects = OrganizationManager()

    db_table_comment = \
        "Contains a list of all of the recognized Vehicle suppliers, both " \
        "past and present, as well as an entry for the government which is " \
        "also considered an organization."

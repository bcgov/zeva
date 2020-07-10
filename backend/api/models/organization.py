import decimal
from datetime import date
from django.db import models
from django.db.models import F, Sum

from auditable.models import Auditable
from .account_balance import AccountBalance
from .credit_transaction import CreditTransaction
from .organization_address import OrganizationAddress
from .user_profile import UserProfile
from ..managers.organization import OrganizationManager


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

    @property
    def balance(self):
        """
        Gets the class A and B balance for the current
        organization
        """
        classes = ['A', 'B']
        balance = {'A': 0, 'B': 0}
        account_balances = AccountBalance.objects.filter(
            organization_id=self.id,
            expiration_date=None
        ).order_by('-id')
        for account_balance in account_balances:
            if account_balance.credit_class_id == 'A':
                balance['A'] = account_balance.balance
            else:
                balance['B'] = account_balance.balance
        return balance

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
            expiration_date__lt=date.today()
        ).exclude(
            expiration_date=F('effective_date')
        ).order_by('-effective_date', '-update_timestamp').first()

        return data

    class Meta:
        db_table = 'organization'

    objects = OrganizationManager()

    db_table_comment = \
        "Contains a list of all of the recognized Vehicle suppliers, both " \
        "past and present, as well as an entry for the government which is " \
        "also considered an organization."

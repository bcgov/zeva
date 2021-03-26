from datetime import date
from django.db.models import Sum, Value, Q
from rest_framework import serializers
from api.serializers.credit_transaction import CreditTransactionListSerializer, \
    CreditTransactionBalanceSerializer, CreditTransactionSerializer
from api.models.account_balance import AccountBalance
from api.models.vehicle import Vehicle
from api.models.sales_submission import SalesSubmission
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.models.model_year_report_compliance_obligation import ModelYearReportComplianceObligation
from api.models.credit_transaction import CreditTransaction
from api.serializers.credit_transaction import CreditClassSerializer, CreditTransactionObligationActivitySerializer
from api.serializers.account_balance import AccountBalanceSerializer
from api.serializers.organization import OrganizationSerializer
from api.serializers.sales_submission import SalesSubmissionListSerializer, SalesSubmissionObligationActivitySerializer


class ComplianceObligationActivityDetailsSerializer(serializers.ModelSerializer):
    """
    """
    prior_year_balance = serializers.SerializerMethodField()
    report_year_balance = serializers.SerializerMethodField()
    report_year_transactions = serializers.SerializerMethodField()
    pending_balance = serializers.SerializerMethodField()

    def retrieve_balance(self, year, credit_type):
        request = self.context.get('request')
        balance = AccountBalance.objects.filter(
            organization=request.user.organization,
            effective_date__lte=date(year, 9, 30),
            credit_class_id=credit_type
        ).order_by('-effective_date').first()
        if balance:
            return balance.balance
        else:
            return 0

    def get_prior_year_balance(self, obj, *args, **kwargs):
        kwargs = self.context.get('kwargs')
        report_year = int(kwargs.get('year'))
        prior_year = report_year-1
        prior_year_balance_a = self.retrieve_balance(prior_year, 1)
        prior_year_balance_b = self.retrieve_balance(prior_year, 2)
        return {'year': prior_year, 'a': prior_year_balance_a, 'b': prior_year_balance_b}

    def get_report_year_balance(self, obj, *args, **kwargs):
        kwargs = self.context.get('kwargs')
        report_year = int(kwargs.get('year'))
        report_year_balance_a = self.retrieve_balance(report_year, 1)
        report_year_balance_b = self.retrieve_balance(report_year, 2)   
        return {'year': report_year, 'a': report_year_balance_a, 'b': report_year_balance_b}

    def get_report_year_transactions(self, obj, *args, **kwargs):
        request = self.context.get('request')
        kwargs = self.context.get('kwargs')
        report_year = int(kwargs.get('year'))
        transfers_in = CreditTransaction.objects.filter(
            credit_to=request.user.organization,
            transaction_type__transaction_type='Credit Transfer',
            transaction_timestamp__lte=date(report_year, 9, 30),
            transaction_timestamp__gte=date(report_year-1, 10, 1),
        ).values(
            'credit_class_id', 'model_year_id'
        ).annotate(
            total_value=Sum('total_value')
        ).order_by(
            'credit_class_id', 'model_year_id'
        )

        transfers_out = CreditTransaction.objects.filter(
            debit_from=request.user.organization,
            transaction_type__transaction_type='Credit Transfer',
            transaction_timestamp__lte=date(report_year, 9, 30),
            transaction_timestamp__gte=date(report_year-1, 10, 1),
        ).values(
            'credit_class_id', 'model_year_id'
        ).annotate(total_value=Sum(
            'total_value')
        ).order_by(
            'credit_class_id', 'model_year_id'
        )

        credits_issued_sales = CreditTransaction.objects.filter(
            credit_to=request.user.organization,
            transaction_type__transaction_type='Validation',
            transaction_timestamp__lte=date(report_year, 9, 30),
            transaction_timestamp__gte=date(report_year-1, 10, 1),
        ).values(
            'credit_class_id', 'model_year_id'
        ).annotate(
            total_value=Sum('total_value')
        ).order_by(
            'credit_class_id', 'model_year_id'
        )

        transfers_in_serializer = CreditTransactionObligationActivitySerializer(transfers_in, read_only=True, many=True)
        transfers_out_serializer = CreditTransactionObligationActivitySerializer(transfers_out, read_only=True, many=True)
        credit_sales_serializer = CreditTransactionObligationActivitySerializer(credits_issued_sales, read_only=True, many=True)
        content = {
            'transfers_in': transfers_in_serializer.data,
            'transfers_out': transfers_out_serializer.data,
            'credits_issued_sales': credit_sales_serializer.data
            }
        return content

    def get_pending_balance(self, obj, *args, **kwargs):
        kwargs = self.context.get('kwargs')
        report_year = int(kwargs.get('year'))
        request = self.context.get('request')
        pending_sales_submissions = SalesSubmission.objects.filter(
            organization=request.user.organization,
            validation_status__in=['SUBMITTED', 'RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'CHECKED'],
            submission_date__lte=date(report_year, 9, 30),
            submission_date__gte=date(report_year-1, 10, 1),
        )
        totals = {}
        for obj in pending_sales_submissions:
            for record in obj.get_content_totals_by_vehicles():
                try:
                    model_year = float(record['xls_model_year'])
                except ValueError:
                    continue
                vehicle = Vehicle.objects.filter(
                    make__iexact=record['xls_make'],
                    model_name=record['xls_model'],
                    model_year__name=int(model_year),
                    validation_status=VehicleDefinitionStatuses.VALIDATED,
                ).first()
                if vehicle:
                    model_year_str = str(int(model_year))
                    if model_year_str not in totals.keys():
                        totals[model_year_str] = {'A': 0, 'B': 0}
                    totals[model_year_str][vehicle.get_credit_class()] += vehicle.get_credit_value() * record['num_vins']
        return totals

    class Meta:
        model = CreditTransaction
        fields = (
            'report_year_balance', 'pending_balance',
            'prior_year_balance', 'report_year_transactions'
        )
class ComplianceObligationActivitySaveSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        print('SAVE SERIALIZER')
        print(validated_data)
        # number_of_credits = validated_data.get('number_of_credits')
        # credit_value = validated_data.get('credit_value')
        # total_value = number_of_credits * credit_value

        # credit_transaction = CreditTransaction.objects.create(
        #     **validated_data,
        #     total_value=total_value
        # )
        # return credit_transaction

    class Meta:
        model = ModelYearReportComplianceObligation
        fields = ('model_year_report', 'model_year',
        'credit_a_value', 'credit_b_value', 'category'
        )

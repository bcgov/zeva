from rest_framework import serializers
from api.models.model_year_report_compliance_obligation import ModelYearReportComplianceObligation
from api.models.model_year_report_credit_offset import ModelYearReportCreditOffset
from api.serializers.vehicle import ModelYearSerializer


## CAN BE REMOVED LATER
# class ModelYearReportComplianceObligationOutputSerializer(serializers.ModelSerializer):
#     model_year = ModelYearSerializer(read_only=True)
#     A = serializers.SerializerMethodField()
#     B = serializers.SerializerMethodField()

#     def get_A(self, obj, *args, **kwargs):
#         return obj.credit_a_value

#     def get_B(self, obj, *args, **kwargs):
#         return obj.credit_b_value

#     class Meta:
#         model = ModelYearReportComplianceObligation
#         fields = (
#             'model_year', 'A', 'B'
#         )


class ModelYearReportComplianceObligationOffsetSerializer(serializers.ModelSerializer):
    model_year = ModelYearSerializer(read_only=True)

    class Meta:
        model = ModelYearReportCreditOffset
        fields = (
            'credit_a_offset_value',  'credit_b_offset_value',
            'model_year', 'model_year_report'
        )


class ModelYearReportComplianceObligationSnapshotSerializer(serializers.ModelSerializer):
    model_year = ModelYearSerializer(read_only=True)

    class Meta:
        model = ModelYearReportComplianceObligation
        fields = (
            'credit_a_value',  'credit_b_value',
            'category', 'model_year', 'update_timestamp',
        )


# class ModelYearReportComplianceObligationDetailsSerializer(serializers.ModelSerializer):
#     """
#     """
#     prior_year_balance = serializers.SerializerMethodField()
#     report_year_balance = serializers.SerializerMethodField()
#     report_year_transactions = serializers.SerializerMethodField()
#     pending_balance = serializers.SerializerMethodField()
#     def retrieve_year(self, report_id):
#         report = ModelYearReport.objects.get(
#             id=report_id
#         )
#         report_year_obj = ModelYear.objects.get(
#             id=report.model_year_id
#         )
#         report_year = int(report_year_obj.name)
#         return report_year

#     def get_prior_year_balance(self, obj, *args, **kwargs):
#         ## this needs to change to grab to grab values from the prior year snapshot
#         kwargs = self.context.get('kwargs')
#         report_id = int(kwargs.get('id'))
#         report_year = self.retrieve_year(report_id)
#         prior_year = report_year-1
#         prior_year_balance_a = self.retrieve_balance(prior_year, 1)
#         prior_year_balance_b = self.retrieve_balance(prior_year, 2)
#         return {'year': prior_year, 'A': prior_year_balance_a, 'B': prior_year_balance_b}

    # def get_report_year_transactions(self, obj, *args, **kwargs):
    #     request = self.context.get('request')
    #     kwargs = self.context.get('kwargs')
    #     report_id = int(kwargs.get('id'))
    #     report_year = self.retrieve_year(report_id)

    #     transfers_in = CreditTransaction.objects.filter(
    #         credit_to=request.user.organization,
    #         transaction_type__transaction_type='Credit Transfer',
    #         transaction_timestamp__lte=date(report_year, 9, 30),
    #         transaction_timestamp__gte=date(report_year-1, 10, 1),
    #     ).values(
    #         'credit_class_id', 'model_year_id'
    #     ).annotate(
    #         total_value=Sum('total_value')
    #     ).order_by(
    #         'credit_class_id', 'model_year_id'
    #     )

    #     transfers_out = CreditTransaction.objects.filter(
    #         debit_from=request.user.organization,
    #         transaction_type__transaction_type='Credit Transfer',
    #         transaction_timestamp__lte=date(report_year, 9, 30),
    #         transaction_timestamp__gte=date(report_year-1, 10, 1),
    #     ).values(
    #         'credit_class_id', 'model_year_id'
    #     ).annotate(total_value=Sum(
    #         'total_value')
    #     ).order_by(
    #         'credit_class_id', 'model_year_id'
    #     )

    #     credits_issued_sales = CreditTransaction.objects.filter(
    #         credit_to=request.user.organization,
    #         transaction_type__transaction_type='Validation',
    #         transaction_timestamp__lte=date(report_year, 9, 30),
    #         transaction_timestamp__gte=date(report_year-1, 10, 1),
    #     ).values(
    #         'credit_class_id', 'model_year_id'
    #     ).annotate(
    #         total_value=Sum('total_value')
    #     ).order_by(
    #         'credit_class_id', 'model_year_id'
    #     )

    #     transfers_in_serializer = CreditTransactionObligationActivitySerializer(transfers_in, read_only=True, many=True)
    #     transfers_out_serializer = CreditTransactionObligationActivitySerializer(transfers_out, read_only=True, many=True)
    #     credit_sales_serializer = CreditTransactionObligationActivitySerializer(credits_issued_sales, read_only=True, many=True)
    #     content = {
    #         'transfers_in': transfers_in_serializer.data,
    #         'transfers_out': transfers_out_serializer.data,
    #         'credits_issued_sales': credit_sales_serializer.data,
    #         'adjustments_validation': adjustments_validation_serializer.data,
    #         'adjustments_reduction': adjustments_reduction_serializer.data
    #         }
    #     return content

    # def get_pending_balance(self, obj, *args, **kwargs):
    #     kwargs = self.context.get('kwargs')
    #     report_id = int(kwargs.get('id'))
    #     report_year = self.retrieve_year(report_id)
    #     request = self.context.get('request')
    #     pending_sales_submissions = SalesSubmission.objects.filter(
    #         organization=request.user.organization,
    #         validation_status__in=['SUBMITTED', 'RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'CHECKED']
    #     )
    #     totals = {}
    #     for obj in pending_sales_submissions:
    #         for record in obj.get_content_totals_by_vehicles():
    #             try:
    #                 model_year = float(record['xls_model_year'])
    #             except ValueError:
    #                 continue
    #             if int(model_year) != int(report_year):
    #                 continue
    #             vehicle = Vehicle.objects.filter(
    #                 make__iexact=record['xls_make'],
    #                 model_name=record['xls_model'],
    #                 model_year__name=int(model_year),
    #                 validation_status=VehicleDefinitionStatuses.VALIDATED,
    #             ).first()
    #             if vehicle:
    #                 model_year_str = str(int(model_year))
    #                 if model_year_str not in totals.keys():
    #                     totals[model_year_str] = {'A': 0, 'B': 0}
    #                 totals[model_year_str][vehicle.get_credit_class()] += vehicle.get_credit_value() * record['num_vins']
    #     return totals

    # class Meta:
    #     model = CreditTransaction
    #     fields = (
    #         'report_year_balance', 'pending_balance', 'prior_year_balance', 'report_year_transactions'
    #     )


## CAN BE REMOVED LATER
# class ModelYearReportComplianceObligationSaveSerializer(serializers.ModelSerializer):
#     model_year = ModelYearSerializer()

#     def create(self, obj, validated_data):
#         return obj

#     class Meta:
#         model = ModelYearReportComplianceObligation
#         fields = ('model_year_report', 'model_year', 'credit_a_value',
#                   'credit_b_value', 'category')

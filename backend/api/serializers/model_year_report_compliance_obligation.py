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

## CAN BE REMOVED LATER
# class ModelYearReportComplianceObligationSaveSerializer(serializers.ModelSerializer):
#     model_year = ModelYearSerializer()

#     def create(self, obj, validated_data):
#         return obj

#     class Meta:
#         model = ModelYearReportComplianceObligation
#         fields = ('model_year_report', 'model_year', 'credit_a_value',
#                   'credit_b_value', 'category')

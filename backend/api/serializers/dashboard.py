"""
Account Balance Serializer
"""
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from enumfields.drf import EnumField
from django.db.models import Q
from api.models.model_year_report import ModelYearReport
from api.serializers.credit_transaction import CreditClassSerializer
from api.serializers.user import MemberSerializer
from api.models.organization import Organization
from api.models.model_year_report_statuses import ModelYearReportStatuses
from django.db.models import Count
from api.models.vehicle import Vehicle
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.models.credit_agreement import CreditAgreement
from api.models.credit_agreement_statuses import CreditAgreementStatuses
from datetime import date
from dateutil.relativedelta import relativedelta

three_months_ago = date.today() - relativedelta(months=+3)
twenty_eight_days_ago = date.today() - relativedelta(days=+28)
# filters for dates are not working

class ModelYearReportCountSerializer(ModelSerializer):
    status = SerializerMethodField()
    total = SerializerMethodField()

    def get_total(self, obj):
        return obj['total']

    def get_status(self, obj):
        request = self.context.get('request')

        if not request.user.is_government:
            if obj['validation_status'].value == 'RECOMMENDED':
                return 'SUBMITTED'
        return obj['validation_status'].value

    class Meta:
        model = ModelYearReport
        fields = ('status', 'total',)


class CreditRequestCountSerializer(ModelSerializer):
    status = SerializerMethodField()
    total = SerializerMethodField()

    def get_total(self, obj):
        return obj['total']

    def get_status(self, obj):
        request = self.context.get('request')

        if not request.user.is_government:
            if obj['validation_status'].value == 'RECOMMEND_APPROVAL' or obj['validation_status'].value == 'RECOMMEND_REJECTION':
                return 'SUBMITTED'
        return obj['validation_status'].value

    class Meta:
        model = SalesSubmission
        fields = ('status', 'total')


class CreditTransferCountSerializer(ModelSerializer):
    status = SerializerMethodField()
    total = SerializerMethodField()

    def get_total(self, obj):
        return obj['total']

    def get_status(self, obj):
        request = self.context.get('request')
        if not request.user.is_government:
            if obj['status'].value in ['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'CHECKED']:
                return 'SUBMITTED'
        return obj['status'].value

    class Meta:
        model = CreditTransfer
        fields = ('status', 'total')


class VehicleCountSerializer(ModelSerializer):
    status = SerializerMethodField()
    total = SerializerMethodField()

    def get_total(self, obj):
        return obj['total']

    def get_status(self, obj):
        request = self.context.get('request')
        return obj['validation_status'].value

    class Meta:
        model = Vehicle
        fields = ('status', 'total',)


class CreditAgreementCountSerializer(ModelSerializer):
    status = SerializerMethodField()
    total = SerializerMethodField()

    def get_total(self, obj):
        return obj['total']

    def get_status(self, obj):
        request = self.context.get('request')

        if not request.user.is_government:
            if obj['status'].value == 'RECOMMENDED':
                return 'SUBMITTED'
        return obj['status'].value

    class Meta:
        model = CreditAgreement
        fields = ('status', 'total',)


class DashboardListSerializer(ModelSerializer):
    """
    Serializer for dashboard model year report
    """
    activity = SerializerMethodField()

    def get_activity(self, obj):
        request = self.context.get('request')
        if not request.user.is_government:
            # get querysets, grouping together and getting counts for each status
            model_year_reports = ModelYearReport.objects.filter(
                organization_id=request.user.organization_id
            ).values('validation_status').annotate(total=Count('id')).order_by('validation_status')

            # vehicles WITHIN 3 MONTHS IF VALIDATED
            vehicles = Vehicle.objects.filter(
                Q(organization_id=request.user.organization.id)).exclude(
                    (Q(update_timestamp__lte=three_months_ago) & Q(validation_status=VehicleDefinitionStatuses.VALIDATED))).values(
                        'validation_status').annotate(total=Count('id')).order_by('validation_status')

            # credit requests WITHIN 28 DAYS if VALIDATED
            credit_requests = SalesSubmission.objects.filter(
                Q(organization=request.user.organization)
            ).exclude(
                (Q(update_timestamp__lte=twenty_eight_days_ago) & Q(validation_status=SalesSubmissionStatuses.VALIDATED)) &
                Q(validation_status__in=(
                    SalesSubmissionStatuses.DELETED,))).values('validation_status').annotate(total=Count('id')).order_by('validation_status')

            # transfers WITHIN 28 DAYS if REJECTED, VALIDATED, or DISAPPROVED
            credit_transfers = CreditTransfer.objects.filter(
                (Q(credit_to_id=request.user.organization.id) &
                    Q(status__in=[
                        CreditTransferStatuses.SUBMITTED,
                        CreditTransferStatuses.APPROVED,
                        CreditTransferStatuses.DISAPPROVED,
                        CreditTransferStatuses.RESCINDED,
                        CreditTransferStatuses.RESCIND_PRE_APPROVAL,
                        CreditTransferStatuses.RECOMMEND_APPROVAL,
                        CreditTransferStatuses.RECOMMEND_REJECTION,
                        CreditTransferStatuses.REJECTED,
                        CreditTransferStatuses.VALIDATED
                        ])) |
                Q(debit_from_id=request.user.organization.id)
                ).exclude(Q(update_timestamp__lte=twenty_eight_days_ago) & (Q(status=CreditTransferStatuses.REJECTED)or Q(status=CreditTransferStatuses.VALIDATED) or Q(status=CreditTransferStatuses.DISAPPROVED))).exclude(
                    status__in=[CreditTransferStatuses.DELETED]).values('status').annotate(total=Count('id')).order_by('status')

            # agreements
            credit_agreements = CreditAgreement.objects.filter(
                Q(organization_id=request.user.organization.id) &
                Q(status__in=[
                        CreditAgreementStatuses.ISSUED,
                        ])).exclude(status__in=[CreditAgreementStatuses.DELETED]).exclude(
                Q(update_timestamp__lte=twenty_eight_days_ago)
                & Q(status=CreditAgreementStatuses.ISSUED)).values('status').annotate(total=Count('id')).order_by('status')

        if request.user.is_government:
            model_year_reports = ModelYearReport.objects.exclude(
                validation_status=ModelYearReportStatuses.DRAFT
            ).values('validation_status').annotate(total=Count('id')).order_by('validation_status')

            # vehicles
            vehicles = Vehicle.objects.exclude(
                validation_status__in=[
                    VehicleDefinitionStatuses.DRAFT,
                    VehicleDefinitionStatuses.VALIDATED,
                    VehicleDefinitionStatuses.NEW]
            ).values('validation_status').annotate(total=Count('id')).order_by('validation_status')


            # credit requests
            credit_requests = SalesSubmission.objects.exclude(validation_status__in=(
                SalesSubmissionStatuses.DRAFT,
                SalesSubmissionStatuses.NEW,
                SalesSubmissionStatuses.DELETED,
            )).values('validation_status').annotate(total=Count('id')).order_by('validation_status')

            #credit transfers
            credit_transfers = CreditTransfer.objects.exclude(status__in=[
                CreditTransferStatuses.DRAFT,
                CreditTransferStatuses.SUBMITTED,
                CreditTransferStatuses.DELETED,
                CreditTransferStatuses.RESCIND_PRE_APPROVAL,
                CreditTransferStatuses.DISAPPROVED,
            ]).values('status').annotate(total=Count('id')).order_by('status')

            #credit agreements
            credit_agreements = CreditAgreement.objects.exclude(status__in=[
                CreditAgreementStatuses.DELETED,
            ]).values('status').annotate(total=Count('id')).order_by('status')


        # serialize querysets
        #model year report
        model_year_report_serializer = ModelYearReportCountSerializer(
            model_year_reports,
            read_only=True,
            many=True,
            context={'request': request}
            )
        # vehicle
        vehicle_serializer = VehicleCountSerializer(
            vehicles,
            read_only=True,
            many=True,
            context={'request': request}
        )
        # credit requests
        credit_request_serializer = CreditRequestCountSerializer(
            credit_requests,
            read_only=True,
            many=True,
            context={'request': request}
        )

        # credit transfers
        credit_transfer_serializer = CreditTransferCountSerializer(
            credit_transfers,
            read_only=True,
            many=True,
            context={'request': request}
        )

        # credit agreements
        credit_agreement_serializer = CreditAgreementCountSerializer(
            credit_agreements,
            read_only=True,
            many=True,
            context={'request': request}
        )

        # return dictionary with activity type as key and number as value
        return {
            'model_year_report': model_year_report_serializer.data,
            'vehicle': vehicle_serializer.data,
            'credit_request': credit_request_serializer.data,
            'credit_transfer': credit_transfer_serializer.data,
            'credit_agreement': credit_agreement_serializer.data
            
        }

    class Meta:
        model = ModelYearReport
        fields = (
            'id', 'activity'
        )

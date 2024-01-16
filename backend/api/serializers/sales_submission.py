from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, ValidationError
from django.db.models import Subquery, Count
from django.db.models.functions import Upper

from api.models.icbc_registration_data import IcbcRegistrationData
from api.models.icbc_upload_date import IcbcUploadDate
from api.models.record_of_sale import RecordOfSale
from api.models.record_of_sale_statuses import RecordOfSaleStatuses
from api.models.sales_submission import SalesSubmission
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.credit_transaction import \
    CreditTransaction
from api.models.sales_submission_statuses import SalesSubmissionStatuses
from api.models.sales_submission_comment import SalesSubmissionComment
from api.models.sales_submission_history import SalesSubmissionHistory
from api.models.vehicle import Vehicle
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.models.icbc_snapshot_data import IcbcSnapshotData
from api.serializers.sales_submission_comment import \
    SalesSubmissionCommentSerializer
from api.models.user_profile import UserProfile
from api.models.vin_statuses import VINStatuses
from api.serializers.user import MemberSerializer
from api.serializers.organization import OrganizationSerializer
from api.serializers.sales_submission_content import \
    SalesSubmissionContentSerializer
from api.serializers.vehicle import VehicleSerializer
from api.services.sales_spreadsheet import get_date
from api.models.sales_evidence import SalesEvidence
from api.serializers.sales_evidence import SalesEvidenceSerializer
from api.services.minio import minio_remove_object


class BaseSerializer():
    def get_update_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.update_user

    def get_create_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.create_user)
        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data
        return obj.create_user

    def get_validation_status(self, obj):
        request = self.context.get('request')

        #  do not show bceid users statuses of CHECKED
        #  CHECKED is really an internal status for IDIR users that someone has
        #  reviewed the vins
        if not request.user.is_government and \
                obj.validation_status in [
                        SalesSubmissionStatuses.CHECKED,
                        SalesSubmissionStatuses.RECOMMEND_APPROVAL,
                        SalesSubmissionStatuses.RECOMMEND_REJECTION
                ]:
            return SalesSubmissionStatuses.SUBMITTED.value

        return obj.get_validation_status_display()


class SalesSubmissionHistorySerializer(
        ModelSerializer, EnumSupportSerializerMixin, BaseSerializer
):
    create_user = SerializerMethodField()
    update_user = SerializerMethodField()
    validation_status = SerializerMethodField()
    
    class Meta:
        model = SalesSubmissionHistory
        fields = (
            'create_timestamp', 'create_user',
            'validation_status', 'update_user'
        )


class SalesSubmissionBaseListSerializer(
    ModelSerializer, EnumSupportSerializerMixin, BaseSerializer
):
    submission_history_timestamp = SerializerMethodField()
    submission_history = SerializerMethodField()
    organization = SerializerMethodField()
    totals = SerializerMethodField()
    total_warnings = SerializerMethodField()
    total_credits = SerializerMethodField()
    validation_status = SerializerMethodField()

    def get_submission_history_timestamp(self, obj):
        request = self.context.get('request')

        if obj.part_of_model_year_report:
            credit_transaction = CreditTransaction.objects.filter(
                sales_submission_credit_transaction__sales_submission_id=obj.id
            ).first()

            if credit_transaction:
                return credit_transaction.transaction_timestamp

        if not request.user.is_government and obj.validation_status in [
            SalesSubmissionStatuses.RECOMMEND_REJECTION,
            SalesSubmissionStatuses.RECOMMEND_APPROVAL,
            SalesSubmissionStatuses.CHECKED,
        ]:
            # return the date that it was submitted
            history = SalesSubmissionHistory.objects.filter(
                submission_id=obj.id,
                validation_status=SalesSubmissionStatuses.SUBMITTED
            ).order_by('-update_timestamp').first()

            if history is None:
                return None

            return history.update_timestamp

        # return the last updated date
        history = SalesSubmissionHistory.objects.filter(
            submission_id=obj.id,
            validation_status=obj.validation_status
        ).order_by('-update_timestamp').first()

        if history is None:
            return None

        return history.update_timestamp
    
    def get_submission_history(self, obj):
        timestamp = self.get_submission_history_timestamp(obj)
        if timestamp:
            return timestamp.date()
        return None

    def get_organization(self, obj):
        return {
            "short_name": obj.organization.short_name
        }
    
    def get_totals(self, obj):
        return {
            'vins': obj.records.count()
        }
    
    def get_total_warnings(self, obj):
        request = self.context.get('request')
        warnings = 0

        valid_statuses = [SalesSubmissionStatuses.VALIDATED]

        if request.user.is_government:
            valid_statuses = [
                SalesSubmissionStatuses.CHECKED,
                SalesSubmissionStatuses.RECOMMEND_APPROVAL,
                SalesSubmissionStatuses.RECOMMEND_REJECTION,
                SalesSubmissionStatuses.VALIDATED
            ]

        if obj.validation_status in valid_statuses:
            warnings = obj.unselected

        return warnings

    def get_total_credits(self, obj):
        request = self.context.get('request')
        total_a = 0
        total_b = 0

        if obj.validation_status in [
                SalesSubmissionStatuses.VALIDATED,
                SalesSubmissionStatuses.REJECTED
        ] or (request.user.is_government and obj.validation_status in [
                SalesSubmissionStatuses.CHECKED,
                SalesSubmissionStatuses.RECOMMEND_APPROVAL,
                SalesSubmissionStatuses.RECOMMEND_REJECTION,
                SalesSubmissionStatuses.VALIDATED
        ]):
            for record in obj.get_records_totals_by_vehicles():
                vehicle = Vehicle.objects.filter(
                    id=record['vehicle_id']
                ).first()

                if vehicle:
                    if vehicle.get_credit_class() == 'A':
                        total_a += vehicle.get_credit_value() * record['num_vins']

                    if vehicle.get_credit_class() == 'B':
                        total_b += vehicle.get_credit_value() * record['num_vins']
        else:
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
                    if vehicle.get_credit_class() == 'A':
                        total_a += vehicle.get_credit_value() * record['num_vins']

                    if vehicle.get_credit_class() == 'B':
                        total_b += vehicle.get_credit_value() * record['num_vins']

        return {
            'a': round(total_a, 2),
            'b': round(total_b, 2)
        }

    class Meta:
        model = SalesSubmission
        fields = [
            'id', 'submission_history_timestamp', 'submission_history', 'organization', 'totals', 'unselected',
            'total_warnings', 'total_credits', 'validation_status'
        ]


class SalesSubmissionListSerializer(
        SalesSubmissionBaseListSerializer
):
    organization = OrganizationSerializer(read_only=True)
    update_user = SerializerMethodField()

    class Meta(SalesSubmissionBaseListSerializer.Meta):
        fields = SalesSubmissionBaseListSerializer.Meta.fields + [
            'submission_sequence', 'submission_id', 
            'update_user', 'update_timestamp'
        ]


class SalesSubmissionObligationActivitySerializer(
        ModelSerializer, EnumSupportSerializerMixin, BaseSerializer
):
    total_credits = SerializerMethodField()

    def get_total_credits(self, obj):
        total_a = 0
        total_b = 0
        totals = {}

        
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
                    totals[model_year_str] = 1
                    print('totals:', totals.keys())
                    # print(model_year_str)
                    # totals[model_year_str] = {vehicle.get_credit_class(): 0}
                # totals[model_year_str][vehicle.get_credit_class()] += vehicle.get_credit_value() * record['num_vins']
                # print(totals.keys())
                # if vehicle.get_credit_class() == 'A':
                #     total_a += vehicle.get_credit_value() * record['num_vins']

                # if vehicle.get_credit_class() == 'B':
                #     total_b += vehicle.get_credit_value() * record['num_vins']
        print(totals)
        return {
            'a': round(total_a, 2),
            'b': round(total_b, 2)
        }

    class Meta:
        model = SalesSubmission
        fields = (
             'total_credits',
        )


class SalesSubmissionSerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        BaseSerializer
):
    evidence = SerializerMethodField()
    content = SerializerMethodField()
    create_user = SerializerMethodField()
    eligible = SerializerMethodField()
    history = SerializerMethodField()
    icbc_current_to = SerializerMethodField()
    organization = OrganizationSerializer(read_only=True)
    sales_submission_comment = SerializerMethodField()
    update_user = SerializerMethodField()
    validation_status = SerializerMethodField()

    def get_evidence(self, instance):
        attachments = SalesEvidence.objects.filter(
            submission_id=instance.id,
            is_removed=False)

        serializer = SalesEvidenceSerializer(attachments, many=True)

        return serializer.data

    def get_content(self, instance):
        request = self.context.get('request')
        skip_content = request.GET.get('skip_content', False)

        if skip_content == 'true':
            return []

        content = []

        def find(lst, search):
            for index, row in enumerate(lst):
                if row['xls_model'] == search['xls_model'] and \
                        row['xls_make'] == search['xls_make'] and \
                        row['xls_model_year'] == search['xls_model_year']:
                    return index

            return None

        valid_vehicles = Vehicle.objects.filter(
            organization_id=instance.organization_id,
            validation_status=VehicleDefinitionStatuses.VALIDATED
        ).values_list('model_year__name', Upper('make'), 'model_name')

        matched_vins = SalesSubmissionContent.objects.filter(
            submission_id=instance.id,
            xls_vin__in=Subquery(IcbcRegistrationData.objects.values('vin'))
        ).values_list('id', flat=True)

        duplicate_vins = SalesSubmissionContent.objects.annotate(
            vin_count=Count('xls_vin')
        ).filter(vin_count__gt=1).values_list('xls_vin', flat=True)

        awarded_vins = RecordOfSale.objects.exclude(
            submission_id=instance.id
        ).values_list('vin', flat=True)

        for row in instance.content:
            warnings = 0

            try:
                model_year = int(float(row.xls_model_year))
            except ValueError:
                model_year = 0
                warnings = 1

            if warnings == 0:
                if not row.valid_sales_date:
                    warnings = 1

            if warnings == 0:
                if row.id not in matched_vins:
                    warnings = 1

            if warnings == 0:
                if (str(model_year), row.xls_make.upper(), row.xls_model) not in valid_vehicles:
                    warnings = 1

            if warnings == 0:
                if row.xls_vin in awarded_vins:
                    warnings = 1

            if warnings == 0:
                if row.xls_vin in duplicate_vins:
                    warnings = 1

            index = find(content, {
                'xls_make': row.xls_make,
                'xls_model': row.xls_model,
                'xls_model_year': model_year,
            })

            if index is not None:
                content[index]['sales'] += 1
                content[index]['warnings'] += warnings
            else:
                content.append({
                    'xls_make': row.xls_make,
                    'xls_model': row.xls_model,
                    'xls_model_year': model_year,
                    'sales': 1,
                    'warnings':  warnings
                })

        for row in content:
            vehicle = Vehicle.objects.filter(
                make__iexact=row['xls_make'],
                model_name=row['xls_model'],
                model_year__name=row['xls_model_year'],
                organization_id=instance.organization_id,
                validation_status=VehicleDefinitionStatuses.VALIDATED,
            ).first()

            vehicle_serializer = VehicleSerializer(
                vehicle, read_only=True, context={'request': request}
            )

            row['vehicle'] = vehicle_serializer.data

        return content

    def get_history(self, obj):
        request = self.context.get('request')

        history = SalesSubmissionHistory.objects.filter(
            submission_id=obj.id
        )

        if not request.user.is_government:
            history = history.exclude(
                validation_status__in=[
                    SalesSubmissionStatuses.RECOMMEND_REJECTION,
                    SalesSubmissionStatuses.RECOMMEND_APPROVAL,
                    SalesSubmissionStatuses.CHECKED,
                ]
            )

        history = history.order_by('-update_timestamp')

        serializer = SalesSubmissionHistorySerializer(
            history, read_only=True, many=True, context={'request': request}
        )

        return serializer.data

    def get_icbc_current_to(self, obj):
        last_checked = SalesSubmissionHistory.objects.filter(
            submission_id=obj.id,
            validation_status=SalesSubmissionStatuses.CHECKED
        ).order_by('-update_timestamp').first()

        if last_checked is None:
            return None

        icbc_upload_date = IcbcUploadDate.objects.filter(
            update_timestamp__lte=last_checked.update_timestamp
        ).order_by('-update_timestamp').first()

        if icbc_upload_date is None:
            return None

        return icbc_upload_date.upload_date

    def get_sales_submission_comment(self, obj):
        request = self.context.get('request')

        if request.user.is_government:
            sales_submission_comment = SalesSubmissionComment.objects.filter(
                sales_submission=obj
            ).order_by('-create_timestamp')
        else:
            sales_submission_comment = SalesSubmissionComment.objects.filter(
                sales_submission=obj,
                to_govt=False
            ).order_by('-create_timestamp')

        if sales_submission_comment.exists():
            serializer = SalesSubmissionCommentSerializer(
                sales_submission_comment, read_only=True, many=True
            )
            return serializer.data

        return None

    def get_eligible(self, instance):
        request = self.context.get('request')

        if not request.user.is_government and \
                instance.validation_status != SalesSubmissionStatuses.VALIDATED:
            return None
        eligible = RecordOfSale.objects.filter(
            submission_id=instance.id
        ).values('vehicle_id').annotate(
            vin_count=Count('vin')
        ).order_by('vehicle_id')

        if not eligible:
            return None

        return eligible

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'validation_status', 'organization', 'submission_date',
            'submission_sequence', 'content', 'submission_id', 'history',
            'sales_submission_comment', 'update_user', 'unselected',
            'update_timestamp', 'create_user', 'filename', 'create_timestamp',
            'eligible', 'icbc_current_to', 'evidence','part_of_model_year_report'
        )


class SalesSubmissionDetailSerializer(
        ModelSerializer, EnumSupportSerializerMixin,
        BaseSerializer
):
    content = SerializerMethodField()

    def get_content(self, instance):
        request = self.context.get('request')

        serializer = SalesSubmissionContentSerializer(
            instance.content,
            read_only=True,
            many=True,
            context={'request': request}
        )

        return serializer.data

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'validation_status', 'content', 'submission_id'
        )


class SalesSubmissionSaveSerializer(
        ModelSerializer
):
    validation_status = EnumField(SalesSubmissionStatuses)
    sales_submission_comment = SalesSubmissionCommentSerializer(
        allow_null=True,
        required=False
    )
    sales_evidences = SalesEvidenceSerializer(
        allow_null=True,
        many=True,
        required=False
    )

    def validate_validation_status(self, value):
        request = self.context.get('request')
        instance = self.instance

        instance.validate_validation_status(value, request)

        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        invalidated = request.data.get('invalidated', None)
        sales_evidences = validated_data.pop('sales_evidences', [])
        files_to_be_removed = request.data.get('evidence_delete_list', [])
        sales_submission_comment = validated_data.pop('sales_submission_comment', None)
        comment_type = request.data.get('comment_type', None)
        reasons = request.data.get('reasons', [])
        reset = request.data.get('reset', None)
        issue_as_model_year_report = request.data.get('issue_as_model_year_report', None)

        if instance.validation_status not in [SalesSubmissionStatuses.DRAFT, SalesSubmissionStatuses.REJECTED] \
                and not request.user.is_government:
            raise ValidationError(
                "Submission cannot be modified when they've been submitted"
            )

        if invalidated is not None and instance.validation_status in [
                SalesSubmissionStatuses.RECOMMEND_APPROVAL,
                SalesSubmissionStatuses.RECOMMEND_REJECTION
        ]:
            raise ValidationError(
                "Cannot make further changes to this submission when "
                "it's been recommended"
            )

        if sales_submission_comment and comment_type:
            SalesSubmissionComment.objects.create(
                create_user=request.user.username,
                sales_submission=instance,
                to_govt=comment_type.get('govt'),
                comment=sales_submission_comment.get('comment')
            )
        for each in sales_evidences:
            SalesEvidence.objects.create(
                create_user=request.user.username,
                submission=instance,
                **each
            )
        for file_id in files_to_be_removed:
            attachment = SalesEvidence.objects.filter(
                id=file_id,
                submission=instance
            ).first()

            if attachment:
                minio_remove_object(attachment.minio_object_name)

                attachment.is_removed = True
                attachment.update_user = request.user.username
                attachment.save()

        if reset == 'Y':
            SalesSubmissionContent.objects.filter(
                submission_id=instance.id,
                reason__isnull=False
            ).update(
                reason=None
            )

        if invalidated is not None:
            # Deleting snapshots
            IcbcSnapshotData.objects.filter(
                submission_id=instance.id
            ).delete()

            all_content = SalesSubmissionContent.objects.filter(
                submission_id=instance.id
            )

            icbc_snapshot = None

            # Rebuilding ICBC snapshots for all sale entries in this submission
            for row in all_content:
                if row.icbc_verification:
                    icbc_snapshot = IcbcSnapshotData.objects.create(
                        vin=row.icbc_verification.vin,
                        make=row.icbc_verification.icbc_vehicle.make,
                        model_name=row.icbc_verification.icbc_vehicle.model_name,
                        model_year=row.icbc_verification.icbc_vehicle.model_year.name,
                        submission=instance,
                        upload_date=row.icbc_verification.icbc_upload_date.upload_date
                    )

            # Deleting potential RecordOfSale records for this submission
            RecordOfSale.objects.filter(submission_id=instance.id).delete()

            # All valid vehicles in the system for this organization
            valid_vehicles = Vehicle.objects.filter(
                organization_id=instance.organization_id,
                validation_status=VehicleDefinitionStatuses.VALIDATED
            ).values_list('model_year__name', Upper('make'), 'model_name')

            # Get submission content that is validated
            content = SalesSubmissionContent.objects.filter(
                submission_id=instance.id
            ).exclude(
                id__in=invalidated
            )

            # Create records for new validated content
            for row in content:
                try:
                    model_year = int(float(row.xls_model_year))
                except ValueError:
                    model_year = 0

                if (
                        str(model_year), row.xls_make.upper(), row.xls_model,
                ) in valid_vehicles:
                    RecordOfSale.objects.create(
                        sale_date=get_date(
                            row.xls_sale_date,
                            row.xls_date_type,
                            row.xls_date_mode
                        ),
                        submission=instance,
                        validation_status=RecordOfSaleStatuses.VALIDATED,
                        vehicle=row.vehicle,
                        vin=row.xls_vin,
                        vin_validation_status=VINStatuses.MATCHED,
                        icbc_snapshot=icbc_snapshot
                    )

        if reasons is not None:
            for reason in reasons:
                content = SalesSubmissionContent.objects.get(
                    id=reason.get('id')
                )
                content.reason = reason.get('reason')
                content.save()

        validation_status = validated_data.get('validation_status')

        if validation_status:
            SalesSubmissionHistory.objects.create(
                submission_id=instance.id,
                validation_status=validation_status,
                update_user=request.user.username,
                create_user=request.user.username,
            )
            instance.validation_status = validation_status
            instance.update_user = request.user.username
            if issue_as_model_year_report is not None:
                instance.part_of_model_year_report=issue_as_model_year_report
            instance.save()

        return instance

    class Meta:
        model = SalesSubmission
        fields = (
            'id', 'organization', 'submission_date',
            'submission_sequence', 'submission_id',
            'validation_status', 'sales_submission_comment',
            'sales_evidences', 'part_of_model_year_report'
        )

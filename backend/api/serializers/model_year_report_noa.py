from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField
from enumfields.drf import EnumField
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.supplemental_report_history import SupplementalReportHistory
from api.models.supplemental_report import SupplementalReport
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer, UserSerializer


class ModelYearReportNoaSerializer(ModelSerializer):
    validation_status = SerializerMethodField()

    def get_validation_status(self, obj):
        if obj.validation_status in [
            ModelYearReportStatuses.ASSESSED,
        ]:
            return obj.get_validation_status_display()

    class Meta:
        model = ModelYearReportHistory
        fields = (
            'update_timestamp', 'validation_status', 'id',
        )


class SupplementalNOASerializer(ModelSerializer):
    status = SerializerMethodField()
    update_user = SerializerMethodField()
    is_reassessment = SerializerMethodField()
    display_superseded_text = SerializerMethodField()

    def get_status(self, obj):
        return obj.validation_status.value

    def get_update_user(self, obj):
        user = UserProfile.objects.filter(username=obj.update_user).first()
        if user is None:
            return obj.create_user
        return user.display_name

    def get_display_superseded_text(self, obj):
        if obj.validation_status == ModelYearReportStatuses.ASSESSED:
            model_year_report_id = SupplementalReport.objects.filter(
                id=obj.supplemental_report_id).values_list(
                'model_year_report_id', flat=True
                ).first()
            supplemental_report = SupplementalReport.objects.filter(
                supplemental_id=obj.supplemental_report_id, 
                model_year_report_id=model_year_report_id,
                status__in=[ModelYearReportStatuses.ASSESSED]
            ).first()

            if supplemental_report:
                return True
        return False

    def get_is_reassessment(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user is None:
            return False

        if user.is_government:
            return True

        return False

    class Meta:
        model = SupplementalReportHistory
        fields = (
            'update_timestamp', 'status', 'id', 'update_user', 'supplemental_report_id', 'display_superseded_text',
            'is_reassessment'
        )


class SupplementalReportHistorySerializer(ModelSerializer):
    status = SerializerMethodField()
    create_user = SerializerMethodField()
    is_reassessment = SerializerMethodField()

    def get_is_reassessment(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user and user.is_government:
            return True

        return False

    def get_status(self, obj):
        return obj.validation_status.value

    def get_create_user(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user is None:
            return None

        serializer = MemberSerializer(user)

        return serializer.data

    class Meta:
        model = SupplementalReportHistory
        fields = (
            'update_timestamp', 'status', 'create_user', 'is_reassessment'
        )


class SupplementalReportSerializer(ModelSerializer):
    status = SerializerMethodField()
    history = SerializerMethodField()
    is_supplementary = SerializerMethodField()

    def get_is_supplementary(self, obj):
        return True

    def get_status(self, obj):
        request = self.context.get('request')

        filter_statuses = [
            ModelYearReportStatuses.ASSESSED,
            ModelYearReportStatuses.REASSESSED
        ]

        if request.user.is_government:
            filter_statuses.append(ModelYearReportStatuses.RECOMMENDED)

        reassessment_report = SupplementalReport.objects.filter(
            supplemental_id=obj.id,
            status__in=filter_statuses
        ).first()

        if reassessment_report:
            return reassessment_report.status.value

        return obj.status.value

    def get_history(self, obj):
        request = self.context.get('request')

        history = SupplementalReportHistory.objects.filter(
            supplemental_report_id=obj.id
        ).order_by('-update_timestamp')

        # is this a supplemental report? (created by bceid user)
        create_user = UserProfile.objects.filter(username=obj.create_user).first()
        if create_user and not create_user.is_government:
            filter_statuses = [
                ModelYearReportStatuses.ASSESSED,
                ModelYearReportStatuses.REASSESSED
            ]

            if request.user.is_government:
                filter_statuses.append(ModelYearReportStatuses.RECOMMENDED)
                history = history.filter(
                    validation_status__in=[
                        ModelYearReportStatuses.SUBMITTED
                    ]
                )

            reassessment_report = SupplementalReport.objects.filter(
                supplemental_id=obj.id,
                status__in=filter_statuses
            ).first()

            if reassessment_report:
                reassessment_history = SupplementalReportHistory.objects.filter(
                    supplemental_report_id=reassessment_report.id,
                    validation_status__in=filter_statuses
                ).order_by('-update_timestamp')
                history = reassessment_history | history
        elif not request.user.is_government:
            filter_statuses = [
                ModelYearReportStatuses.ASSESSED,
                ModelYearReportStatuses.REASSESSED
            ]

            history = history.filter(
                validation_status__in=filter_statuses
            )

        # Remove submitted by government user (only happens when the IDIR user saves first)
        users = UserProfile.objects.filter(organization__is_government=True).values_list('username')
        history = history.exclude(
            validation_status__in=[
                ModelYearReportStatuses.SUBMITTED,
            ],
            create_user__in=users
        )

        serializer = SupplementalReportHistorySerializer(history, many=True)

        return serializer.data

    class Meta:
        model = SupplementalReport
        fields = (
            'update_timestamp', 'status', 'id', 'update_user', 'history',
            'supplemental_id', 'is_supplementary',
        )


class SupplementalModelYearReportSerializer(ModelSerializer):
    status = SerializerMethodField()
    history = SerializerMethodField()
    supplemental_id = SerializerMethodField()
    is_supplementary = SerializerMethodField()

    def get_is_supplementary(self, obj):
        return False

    def get_supplemental_id(self, _obj):
        return None

    def get_status(self, obj):
        request = self.context.get('request')

        if not request.user.is_government and \
            obj.validation_status in [ModelYearReportStatuses.RECOMMENDED]:
            return ModelYearReportStatuses.SUBMITTED.value

        return obj.validation_status.value

    def get_history(self, obj):
        request = self.context.get('request')

        history = ModelYearReportHistory.objects.filter(
            model_year_report_id=obj.id
        ).order_by('-update_timestamp')

        if request.user.is_government:
            history = history.exclude(
                validation_status__in=[
                    ModelYearReportStatuses.DELETED,
                ]
            )
        else:
            history = history.exclude(
                validation_status__in=[
                    ModelYearReportStatuses.RECOMMENDED,
                    ModelYearReportStatuses.DELETED,
                    ModelYearReportStatuses.RETURNED,
                ]
            )

        # Remove submitted by government user (only happens when the IDIR user saves first)
        users = UserProfile.objects.filter(organization__is_government=True).values_list('username')
        history = history.exclude(
            validation_status__in=[
                ModelYearReportStatuses.SUBMITTED,
            ],
            create_user__in=users
        )

        serializer = SupplementalReportHistorySerializer(history, many=True)

        return serializer.data

    class Meta:
        model = ModelYearReport
        fields = (
            'update_timestamp', 'status', 'id', 'update_user', 'history',
            'supplemental_id', 'is_supplementary',
        )
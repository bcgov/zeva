from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.supplemental_report_history import SupplementalReportHistory
from api.models.supplemental_report import SupplementalReport
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer
from ..mixins.user_mixin import UserMixin
from django.db.models import Q
from api.utilities.report_history import exclude_from_history
from api.mixins.user_mixin import UserMixin


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


class SupplementalNOASerializer(ModelSerializer, UserMixin):
    status = SerializerMethodField()
    is_reassessment = SerializerMethodField()
    display_superseded_text = SerializerMethodField()
    update_user = SerializerMethodField()

    def get_status(self, obj):
        return obj.validation_status.value

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
            'update_timestamp', 'status', 'id', 'supplemental_report_id', 'display_superseded_text',
            'is_reassessment', 'update_user'
        )


class ModelYearReportHistorySerializer(ModelSerializer, UserMixin):
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

    class Meta:
        model = ModelYearReportHistory
        fields = (
            'update_timestamp', 'status', 'create_user', 'is_reassessment'
        )


class SupplementalReportHistorySerializer(ModelYearReportHistorySerializer):
    class Meta:
        model = SupplementalReportHistory
        fields = ModelYearReportHistorySerializer.Meta.fields + ('supplemental_report_id',)


class SupplementalReportSerializer(ModelSerializer, UserMixin):
    status = SerializerMethodField()
    history = SerializerMethodField()
    is_supplementary = SerializerMethodField()
    update_user = SerializerMethodField()

    def get_is_supplementary(self, obj):
        return True

    def get_status(self, obj):
        request = self.context.get('request')

        if not request.user.is_government and \
            obj.status in [ModelYearReportStatuses.RECOMMENDED, ModelYearReportStatuses.RETURNED]:
            return ModelYearReportStatuses.SUBMITTED.value

        return obj.status.value

    def get_history(self, obj):
        request = self.context.get('request')

        q_obj = Q(supplemental_report_id=obj.id)
        if obj.supplemental_id:
            previous_supplemental = SupplementalReport.objects.filter(id=obj.supplemental_id).first()
            if previous_supplemental and previous_supplemental.status == ModelYearReportStatuses.SUBMITTED and not previous_supplemental.is_reassessment:
                q_obj = q_obj | Q(supplemental_report_id=obj.supplemental_id)

        history = SupplementalReportHistory.objects.filter(
            q_obj
        ).order_by('-update_timestamp')

        refined_history = exclude_from_history(history, request.user)

        serializer = SupplementalReportHistorySerializer(refined_history, many=True, context={'request': request})
        return serializer.data

    class Meta:
        model = SupplementalReport
        fields = (
            'update_timestamp', 'status', 'id', 'update_user', 'history',
            'supplemental_id', 'is_supplementary',
        )


class SupplementalModelYearReportSerializer(ModelSerializer, UserMixin):
    status = SerializerMethodField()
    history = SerializerMethodField()
    supplemental_id = SerializerMethodField()
    is_supplementary = SerializerMethodField()
    update_user = SerializerMethodField()

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

        refined_history = exclude_from_history(history, request.user)

        serializer = ModelYearReportHistorySerializer(refined_history, many=True, context={'request': request})

        return serializer.data

    class Meta:
        model = ModelYearReport
        fields = (
            'update_timestamp', 'status', 'id', 'update_user', 'history',
            'supplemental_id', 'is_supplementary',
        )
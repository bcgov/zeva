from datetime import date
from django.db.models import Sum, Value, Q
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField, CharField, \
    ListField
from api.models.account_balance import AccountBalance
from api.models.credit_transaction import CreditTransaction
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_assessment_comment import ModelYearReportAssessmentComment
from api.models.user_profile import UserProfile
from api.serializers.user import MemberSerializer, UserSerializer


class ModelYearReportAssessmentCommentSerializer(ModelSerializer):
    """
    Serializer for assessment comments
    """
    create_user = SerializerMethodField()

    def get_create_user(self, obj):
        user = UserProfile.objects.filter(username=obj.create_user).first()
        if user is None:
            return obj.create_user

        serializer = MemberSerializer(user, read_only=True)
        return serializer.data

    class Meta:
        model = ModelYearReportAssessmentComment
        fields = (
            'id', 'comment', 'create_timestamp', 'create_user', 'to_director'
        )
        read_only_fields = (
            'id',
        )

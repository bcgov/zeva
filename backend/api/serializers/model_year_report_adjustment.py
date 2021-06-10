from rest_framework.serializers import ModelSerializer, SlugRelatedField
from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass

from api.models.model_year_report_adjustment import \
    ModelYearReportAdjustment


class ModelYearReportAdjustmentSerializer(ModelSerializer):
    credit_class = SlugRelatedField(
        slug_field='credit_class',
        queryset=CreditClass.objects.all()
    )
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )

    class Meta:
        model = ModelYearReportAdjustment
        fields = (
            'id', 'credit_class', 'model_year', 'is_reduction',
            'number_of_credits',
        )

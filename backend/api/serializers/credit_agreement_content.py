from rest_framework.serializers import ModelSerializer, SlugRelatedField
from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass

from api.models.credit_agreement_content import \
    CreditAgreementContent


class CreditAgreementContentSerializer(ModelSerializer):
    credit_class = SlugRelatedField(
        slug_field='credit_class',
        queryset=CreditClass.objects.all()
    )
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )

    class Meta:
        model = CreditAgreementContent
        fields = (
            'id', 'credit_class', 'model_year', 'number_of_credits',
        )

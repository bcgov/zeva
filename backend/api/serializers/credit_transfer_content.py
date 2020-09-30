from rest_framework.serializers import ModelSerializer, \
    SlugRelatedField

from api.models.credit_transfer_content import CreditTransferContent
from api.models.credit_class import CreditClass
from api.models.model_year import ModelYear
from api.models.weight_class import WeightClass
from api.serializers.credit_transaction import CreditClassSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.serializers.weight_class import WeightClassSerializer


class CreditTransferContentSerializer(ModelSerializer):
    """
    Credit Transfer Content read serializer
    """
    credit_class = CreditClassSerializer(read_only=True)
    model_year = ModelYearSerializer(read_only=True)
    weight_class = WeightClassSerializer(read_only=True)

    class Meta:
        model = CreditTransferContent
        fields = (
            'credit_value', 'dollar_value', 'credit_class', 'model_year',
            'weight_class',
        )


class CreditTransferContentSaveSerializer(ModelSerializer):
    """
    Credit Transfer Content save serializer
    """
    credit_class = SlugRelatedField(
        slug_field='credit_class',
        queryset=CreditClass.objects.all()
    )
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    weight_class = SlugRelatedField(
        slug_field='weight_class_code',
        queryset=WeightClass.objects.all()
    )

    def create(self, validated_data):
        credit_transfer = self.context.get('credit_transfer')
        credit_transfer_content = CreditTransferContent.objects.create(
            **validated_data,
            credit_transfer=credit_transfer
        )
        return credit_transfer_content

    class Meta:
        model = CreditTransferContent
        fields = (
            'create_user', 'credit_class', 'credit_value', 'dollar_value',
            'model_year', 'update_user', 'weight_class',
        )

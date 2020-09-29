from rest_framework.serializers import ModelSerializer

from api.models.credit_transfer_content import CreditTransferContent
from api.serializers.credit_transaction import CreditClassSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.serializers.weight_class import WeightClassSerializer


class CreditTransferContentSerializer(ModelSerializer):
    """
    Serializer for credit transactions
    """
    credit_class = CreditClassSerializer(read_only=True)
    model_year = ModelYearSerializer(read_only=True)
    weight_class = WeightClassSerializer(read_only=True)

    class Meta:
        model = CreditTransferContent
        fields = (
            'credit_value', 'dollar_value', 'credit_class', 'model_year',
            'weight_class', 'total_value',
        )

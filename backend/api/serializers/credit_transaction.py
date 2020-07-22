from rest_framework.serializers import ModelSerializer, SerializerMethodField

from api.models.credit_class import CreditClass
from api.models.credit_transaction import CreditTransaction
from api.models.credit_transaction_type import CreditTransactionType
from api.models.model_year import ModelYear
from api.models.weight_class import WeightClass
from api.serializers.organization import OrganizationSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.serializers.weight_class import WeightClassSerializer


class CreditClassSerializer(ModelSerializer):
    class Meta:
        model = CreditClass
        fields = (
            'credit_class',
        )


class CreditTransactionTypeSerializer(ModelSerializer):
    class Meta:
        model = CreditTransactionType
        fields = (
            'transaction_type',
        )


class CreditTransactionSerializer(ModelSerializer):
    """
    Serializer for credit transactions
    """
    debit_from = OrganizationSerializer()
    credit_to = OrganizationSerializer()
    credit_class = CreditClassSerializer()
    transaction_type = CreditTransactionTypeSerializer()

    class Meta:
        model = CreditTransaction
        fields = (
            'credit_value', 'credit_to', 'debit_from', 'transaction_timestamp',
            'credit_class', 'transaction_type', 'id'
        )


class CreditTransactionBalanceSerializer(ModelSerializer):
    """
    Serializer for credit transactions
    """
    credit_class = SerializerMethodField()
    weight_class = SerializerMethodField()
    model_year = SerializerMethodField()

    def get_credit_class(self, obj):
        credit_class = CreditClass.objects.get(id=obj.get('credit_class_id'))

        serializer = CreditClassSerializer(credit_class, read_only=True)
        return serializer.data

    def get_weight_class(self, obj):
        weight_class = WeightClass.objects.get(id=obj.get('weight_class_id'))

        serializer = WeightClassSerializer(weight_class, read_only=True)
        return serializer.data

    def get_model_year(self, obj):
        model_year = ModelYear.objects.get(id=obj.get('model_year_id'))

        serializer = ModelYearSerializer(model_year, read_only=True)
        return serializer.data

    class Meta:
        model = CreditTransaction
        fields = (
            'credit_value', 'credit_class', 'model_year', 'weight_class',
        )

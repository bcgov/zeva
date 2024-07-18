from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField
from enumfields.drf import EnumField

from api.models.credit_class import CreditClass
from api.models.credit_transaction import CreditTransaction
from api.models.credit_transaction_type import CreditTransactionType
from api.models.model_year import ModelYear
from api.models.weight_class import WeightClass
from api.serializers.organization import OrganizationSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.serializers.weight_class import WeightClassSerializer
from api.models.credit_agreement_transaction_types import CreditAgreementTransactionTypes
from api.utilities.credit_transaction import get_category, get_signed_value


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
            'credit_class', 'transaction_type', 'id', 'number_of_credits',
            'total_value', 'model_year_id'
        )


class CreditTransactionListSerializer(ModelSerializer):
    """
    Serializer for credit transactions
    """
    credit_class = SerializerMethodField()
    foreign_key = SerializerMethodField()
    total_value = SerializerMethodField()
    transaction_type = SerializerMethodField()
    model_year = SerializerMethodField()
    detail_transaction_type = EnumField(CreditAgreementTransactionTypes)

    def get_credit_class(self, obj):
        credit_class = CreditClass.objects.get(id=obj.get('credit_class_id'))

        serializer = CreditClassSerializer(credit_class, read_only=True)
        return serializer.data

    def get_foreign_key(self, obj):
        return obj.get(
            'foreign_key'
        )

    def get_total_value(self, obj):
        return obj.get('total_value')

    def get_transaction_type(self, obj):
        transaction_type = CreditTransactionType.objects.get(
            id=obj.get('transaction_type_id')
        )

        serializer = CreditTransactionTypeSerializer(
            transaction_type, read_only=True
        )
        return serializer.data

    def get_model_year(self, obj):
        model_year = ModelYear.objects.get(id=obj.get('model_year_id'))

        serializer = ModelYearSerializer(model_year, read_only=True)
        return serializer.data

    class Meta:
        model = CreditTransaction
        fields = (
            'credit_class', 'foreign_key', 'total_value',
            'transaction_timestamp', 'transaction_type', 'model_year',
            'detail_transaction_type',
        )


class CreditTransactionBalanceSerializer(ModelSerializer):
    """
    Serializer for credit transactions
    """
    total_value = SerializerMethodField()
    credit_class = SerializerMethodField()
    weight_class = SerializerMethodField()
    model_year = SerializerMethodField()

    def get_total_value(self, obj):
        return obj.get('total_value')

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
            'total_value', 'credit_class', 'model_year', 'weight_class',
        )


class CreditTransactionObligationActivitySerializer(ModelSerializer):
    """
    Serializer for credit transactions
    """
    credit_class = SerializerMethodField()
    model_year = SerializerMethodField()
    def get_credit_class(self, obj):
        credit_class = CreditClass.objects.get(id=obj.get('credit_class_id'))

        serializer = CreditClassSerializer(credit_class, read_only=True)
        return serializer.data

    def get_model_year(self, obj):
        model_year = ModelYear.objects.get(id=obj.get('model_year_id'))

        serializer = ModelYearSerializer(model_year, read_only=True)
        return serializer.data

    class Meta:
        model = CreditTransaction
        fields = (
            'total_value', 'credit_class', 'model_year',
        )


class CreditTransactionSaveSerializer(ModelSerializer):
    """
    Serializer for credit transactions
    """
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    credit_class = SlugRelatedField(
        slug_field='credit_class',
        queryset=CreditClass.objects.all()
    )
    weight_class = SlugRelatedField(
        slug_field='weight_class_code',
        queryset=WeightClass.objects.all()
    )
    transaction_type = SlugRelatedField(
        slug_field='transaction_type',
        queryset=CreditTransactionType.objects.all()
    )

    def create(self, validated_data):
        number_of_credits = validated_data.get('number_of_credits')
        credit_value = validated_data.get('credit_value')
        total_value = number_of_credits * credit_value

        credit_transaction = CreditTransaction.objects.create(
            **validated_data,
            total_value=total_value
        )
        return credit_transaction

    class Meta:
        model = CreditTransaction
        fields = (
            'credit_value', 'credit_to', 'debit_from', 'transaction_timestamp',
            'credit_class', 'transaction_type', 'id', 'weight_class',
            'model_year', 'create_user', 'update_user', 'number_of_credits',
        )


class CreditTransactionBalanceItemSerializer(ModelSerializer):
    """
    Serializer for credit transactions
    """

    total_value = SerializerMethodField()
    credit_class = SerializerMethodField()
    weight_class = SerializerMethodField()
    model_year = SerializerMethodField()

    def get_total_value(self, obj):
        if self.context.get("contains_related") is True:
            if (
                self.context.get("get_signed_value") is True
                and self.context.get("organization") is not None
            ):
                return get_signed_value(obj, self.context.get("organization"))
            return obj.total_value
        else:
            # implement later, if necessary
            pass

    def get_credit_class(self, obj):
        if self.context.get("contains_related") is True:
            serializer = CreditClassSerializer(obj.credit_class, read_only=True)
            return serializer.data
        else:
            # implement later, if necessary
            pass

    def get_weight_class(self, obj):
        if self.context.get("contains_related") is True:
            serializer = WeightClassSerializer(obj.weight_class, read_only=True)
            return serializer.data
        else:
            # implement later, if necessary
            pass

    def get_model_year(self, obj):
        if self.context.get("contains_related") is True:
            serializer = ModelYearSerializer(obj.model_year, read_only=True)
            return serializer.data
        else:
            # implement later, if necessary
            pass

    class Meta:
        model = CreditTransaction
        fields = (
            "total_value",
            "credit_class",
            "model_year",
            "weight_class",
        )


class CreditTransactionComplianceReportSerializer(ModelSerializer):
    """
    Serializer for credit transactions
    """

    credit_a_value = SerializerMethodField()
    credit_b_value = SerializerMethodField()
    category = SerializerMethodField()
    model_year = SerializerMethodField()

    def get_credit_a_value(self, obj):
        if self.context.get("contains_related") is True:
            if obj.credit_class.credit_class == "A":
                if (
                    self.context.get("get_signed_value") is True
                    and self.context.get("organization") is not None
                ):
                    return get_signed_value(obj, self.context.get("organization"))
                return obj.total_value
            return 0
        else:
            # implement later, if necessary
            pass

    def get_credit_b_value(self, obj):
        if self.context.get("contains_related") is True:
            if obj.credit_class.credit_class == "B":
                if (
                    self.context.get("get_signed_value") is True
                    and self.context.get("organization") is not None
                ):
                    return get_signed_value(obj, self.context.get("organization"))
                return obj.total_value
            return 0
        else:
            # implement later, if necessary
            pass

    def get_category(self, obj):
        if self.context.get("contains_related") is True:
            return get_category(obj)
        else:
            # implement later, if necessary
            pass

    def get_model_year(self, obj):
        if self.context.get("contains_related") is True:
            serializer = ModelYearSerializer(obj.model_year, read_only=True)
            return serializer.data
        else:
            # implement later, if necessary
            pass

    class Meta:
        model = CreditTransaction
        fields = ("credit_a_value", "credit_b_value", "category", "model_year")

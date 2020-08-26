from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField

from api.models.credit_transfer import CreditTransfer
from api.models.credit_transfer_statuses import CreditTransferStatuses
from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass


class CreditTransferSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    status = EnumField(CreditTransferStatuses, read_only=True)
   
    class Meta:
        model = CreditTransfer
        fields = ('id', 'to_supplier', 'from_supplier', 'credit_class',
                  'model_year', 'number_of_credits', 'value_per_credit',
                  'total_value', 'status')


class CreditTransferSaveSerializer(ModelSerializer):
    """
    Serializer to create a transfer
    """
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    credit_class = SlugRelatedField(
        slug_field='credit_class',
        queryset=CreditClass.objects.all()
    )
    status = EnumField(CreditTransferStatuses)

    def create(self, validated_data):
        request = self.context.get('request')
        credit_transfer = CreditTransfer.objects.create(**validated_data)
        return credit_transfer

    class Meta:
        model = CreditTransfer
        fields = ('id', 'to_supplier', 'from_supplier', 'credit_class',
                  'model_year', 'number_of_credits', 'value_per_credit',
                  'status')


class CreditTransferMultiSaveSerializer(ModelSerializer):
    rows = CreditTransferSaveSerializer(many=True)
    def create(self, validated_data):
        rows = validated_data.get('rows')
        for row in rows:
            total = row.get('number_of_credits') * row.get('value_per_credit')
            CreditTransfer.objects.create(**row, total_value=total)
        return validated_data

    class Meta:
        model = CreditTransfer
        fields = ('rows',)

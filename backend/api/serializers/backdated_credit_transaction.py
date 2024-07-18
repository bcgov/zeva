from rest_framework.serializers import ModelSerializer, SerializerMethodField
from api.models.backdated_credit_transaction import BackdatedCreditTransaction


class BackdatedCreditTransactionContextSerializer(ModelSerializer):
    credit_transaction = SerializerMethodField()

    def get_credit_transaction(self, obj):
        serializer_class = self.context.get("credit_transaction_serializer")
        serializer = serializer_class(
            obj.credit_transaction, many=False, read_only=True, context=self.context
        )
        return serializer.data

    class Meta:
        model = BackdatedCreditTransaction
        fields = (
            "id",
            "credit_transaction",
            "compliance_year",
            "accounted_for_in_model_year_report",
            "accounted_for_in_supplemental",
        )

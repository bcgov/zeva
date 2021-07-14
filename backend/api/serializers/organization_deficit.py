from rest_framework.serializers import ModelSerializer

from api.models.organization_deficits import OrganizationDeficits
from api.serializers.credit_transaction import CreditClassSerializer
from api.serializers.vehicle import ModelYearSerializer


class OrganizationDeficitsSerializer(ModelSerializer):
    credit_class = CreditClassSerializer(read_only=True)
    model_year = ModelYearSerializer(read_only=True)

    class Meta:
        model = OrganizationDeficits
        fields = (
            'id', 'credit_value', 'credit_class', 'model_year'
        )

from rest_framework.serializers import ModelSerializer

from api.models.model_year_report_address import ModelYearReportAddress
from api.serializers.organization_address import AddressTypeSerializer


class ModelYearReportAddressSerializer(ModelSerializer):
    address_type = AddressTypeSerializer()

    class Meta:
        model = ModelYearReportAddress
        fields = (
            'representative_name', 'address_line_1', 'address_line_2',
            'address_line_3', 'city', 'postal_code', 'state', 'county',
            'country', 'other', 'address_type',
        )

from rest_framework.serializers import ModelSerializer, SlugRelatedField

from api.models.model_year import ModelYear
from api.models.organization_ldv_sales import OrganizationLDVSales


class OrganizationLDVSalesSerializer(ModelSerializer):
    """
    Serializer for saving/editing the Supplier
    Loads most of the fields and the balance for the Supplier
    """
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )

    def save(self):
        request = self.context.get('request')
        organization = self.context.get('organization')
        model_year = self.validated_data.get('model_year')
        ldv_sales = self.validated_data.get('ldv_sales')
        is_supplied = self.validated_data.get('is_supplied')

        organization_ldv_sale = OrganizationLDVSales.objects.update_or_create(
            model_year_id=model_year.id,
            organization_id=organization.id,
            is_supplied=is_supplied,
            defaults={
                'ldv_sales': ldv_sales,
                'create_user': request.user.username,
                'update_user': request.user.username
            }
        )

        return organization_ldv_sale

    class Meta:
        model = OrganizationLDVSales
        fields = (
            'id', 'ldv_sales', 'model_year', 'is_supplied'
        )

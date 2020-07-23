from rest_framework.serializers import ModelSerializer
from api.models.weight_class import WeightClass


class WeightClassSerializer(ModelSerializer):
    class Meta:
        model = WeightClass
        fields = ('id', 'weight_class_code', 'description',)

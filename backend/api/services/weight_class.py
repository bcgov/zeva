from api.models.weight_class import WeightClass


def get_weight_class_by_code(code):
    return WeightClass.objects.get(weight_class_code=code)

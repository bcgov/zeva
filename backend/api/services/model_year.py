from api.models.model_year import ModelYear


def get_model_years():
    return ModelYear.objects.all().order_by("name")

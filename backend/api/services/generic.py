# this is probably only useful when the key refers to a unique field of the model associated with the qs
def get_model_instances_map(qs, model, key):
    result = {}
    for instance in qs:
        value = getattr(instance, key)
        if value is not None:
            result[value] = instance

    def get_or_create(value):
        if value in result:
            return result[value]
        instance, created = model.objects.get_or_create(**{key: value})
        result[value] = instance
        return instance

    return get_or_create

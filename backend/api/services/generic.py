# this is probably only useful when the key refers to a unique field of the model associated with the qs
def get_model_instances_map(qs, key):
    result = {}
    for instance in qs:
        value = getattr(instance, key)
        if value is not None:
            result[value] = instance
    return result

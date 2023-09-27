# map param should be dict where the values are arrays
def get_inverse_map(map):
    result = {}
    for key, values in map.items():
        for value in values:
            if value not in result:
                result[value] = []
            result[value].append(key)
    return result

from django.db.models import Q


def get_search_type_and_terms(value, delimiter, suffix_type_dict):
    value_suffix = None
    search_type = None
    search_terms = []
    for suffix, type in suffix_type_dict.items():
        if value.endswith(suffix):
            value_suffix = suffix
            search_type = type
            break

    transformed_value = value.rstrip(value_suffix)
    potential_search_terms = transformed_value.split(delimiter)
    for potential_search_term in potential_search_terms:
        transformed_potential_search_term = potential_search_term.strip()
        if transformed_potential_search_term:
            search_terms.append(transformed_potential_search_term)

    return {"type": search_type, "terms": search_terms}


def get_search_q_object(search_terms, search_type, field_name, extra_q_objects=[]):
    final_q = None
    for index, term in enumerate(search_terms):
        filter_lookup = {
            "{field_name}__{search_type}".format(
                field_name=field_name, search_type=search_type
            ): term
        }
        q_obj = Q(**filter_lookup)
        if index == 0:
            final_q = q_obj
        else:
            final_q = final_q | q_obj
    
    for extra_q_object in extra_q_objects:
        if final_q:
            final_q = final_q | extra_q_object
        else:
            final_q = extra_q_object

    return final_q

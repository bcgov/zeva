from rest_framework import exceptions


def permission_required(permission):
    def wrapper(func):
        def wrapped(request, *args, **kwargs):
            if not request.user.has_perm(permission):
                raise exceptions.PermissionDenied(
                    'You do not have sufficient authorization to use this '
                    'functionality.'
                )

            return func(request, *args, **kwargs)
        return wrapped
    return wrapper

from rest_framework import exceptions


def authorization_required(role):
    def wrapper(func):
        def wrapped(self, request, *args, **kwargs):

            if role not in request.user.roles:
                raise exceptions.PermissionDenied(
                    'You do not have sufficient authorization to use this '
                    'functionality.'
                )

            return func(self, request, *args, **kwargs)

        return wrapped

    return wrapper

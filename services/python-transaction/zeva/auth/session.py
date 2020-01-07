import logging

import grpc
import functools

from configuration.db import DB, get_session


def inject_session(func):
    """Inject the session into a grpc context"""

    @functools.wraps(func)
    def wrapper(self, request, context):
        setattr(context, 'session', get_session())
        return func(self, request, context)

    return wrapper


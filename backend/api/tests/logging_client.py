import logging
import inspect

from django.test import Client

logger = logging.getLogger('zeva.test.network')


class ClientLoggingMetaclass(type):
    """
    A metaclass for adding functionality to Django Client test utility
    """

    wrapped_calls = ['get', 'post', 'put', 'patch', 'delete', 'head']

    def __new__(mcs, name, bases, dictionary):
        """Wrap parent calls with interceptor"""

        for base in bases:
            for key, value in base.__dict__.items():
                if hasattr(value, "__call__") and key in ClientLoggingMetaclass.wrapped_calls:
                    dictionary[key] = ClientLoggingMetaclass.wrap_call(
                        key, value)

        return type.__new__(mcs, name, bases, dictionary)

    @classmethod
    def wrap_call(mcs, name, method):
        """Wrap calls to targeted functions"""

        # logging.debug("wrapping calls to {}".format(name))

        data_param = None
        path_param = None

        for index, param in enumerate(
                inspect.signature(method).parameters.values()):
            if param.name == "data":
                data_param = (index, param)
            if param.name == "path":
                path_param = (index, param)

        def call(*args, **kw):
            """
            Delegate to target, but log HTTP request and response attributes
            """
            results = method(*args, **kw)
            try:
                data = 'N/A'
                if data_param is not None and data_param[1] is not None:
                    if data_param[1].kind == inspect.Parameter.POSITIONAL_ONLY:
                        data = args[data_param[0]]
                    else:
                        data = kw[data_param[1].name] if data_param[1].name in kw else 'N/A'

                logger.debug(
                    '\n--------\n'
                    'network exchange details:\n'
                    '--------\n'
                    '{method} request for {url}\n'
                    'response status {status}\n'
                    '--request payload--\n{req}\n'
                    '--response body--\n{res}\n'
                    '---------\n'.format(
                        method=str(name).upper(),
                        url=args[path_param[0]] if path_param is not None else 'N/A',
                        status=results.status_code,
                        req=data,
                        res=results.content.decode('utf-8'),
                    ))
            except UnicodeError:
                logger.error(
                    'Error when trying to decode.'
                    'If this is related to xls, this can be ignored')
            except (KeyError, AttributeError):
                logger.error(
                    'unexpected error while wrapping network request call')

            return results

        return call


class LoggingClient(Client, metaclass=ClientLoggingMetaclass):
    """
    A Client that logs network exchanges.
    Drop-in descendant of django.test.client
    """
    pass

import logging

import grpc
import functools

from auth.jwt import JWTAuthenticator, AuthenticationFailed


def authenticated(func):

    @functools.wraps(func)
    def wrapper(self, request, context):
        logging.info(request)
        logging.info(context)

        auth = JWTAuthenticator()

        try:
            auth_header = next(filter(lambda t: t[0] == 'authorization', context.invocation_metadata()), None)
            if auth_header is None:
                context.abort(
                    grpc.StatusCode.UNAUTHENTICATED,
                    'No authentication header',
                )

            logging.info('auth_header: {}'.format(auth_header))
            user = auth.validate_token_and_load_user(auth_header[1])
            setattr(context, 'user', user)
            # request.user = user

        except AuthenticationFailed as e:
            logging.error(e)
            context.abort(
                grpc.StatusCode.UNAUTHENTICATED,
                'Authentication failed',
            )

        return func(self, request, context)

    return wrapper


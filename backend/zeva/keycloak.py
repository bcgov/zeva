import os


def config():
    return {
        'ENABLED': True,
        'REALM': os.getenv('KEYCLOAK_REALM_URL', 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard'),
        'CLIENT_ID': os.getenv('KEYCLOAK_CLIENT_ID', 'zeva-on-gold-4543'),
        'AUDIENCE': os.getenv('KEYCLOAK_AUDIENCE', 'zeva-on-gold-4543'),
        'ISSUER': os.getenv('KEYCLOAK_ISSUER', 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard'),
        'CERTS_URL': os.getenv(
            'KEYCLOAK_CERTS_URL',
            'https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/certs'
        ),
        'DOWNLOAD_CERTS': bool(os.getenv(
            'KEYCLOAK_DOWNLOAD_CERTS',
            'true'
        ).lower() in ['true', '1']),
        'RS256_KEY': None,
        'TESTING_ENABLED': os.getenv('TESTING_ENABLED', False)
    }

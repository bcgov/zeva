import os


def config():
    return {
        'ENABLED': True,
        'REALM': os.getenv('KEYCLOAK_REALM_URL', 'http://localhost:8888/auth/realms/zeva'),
        'CLIENT_ID': os.getenv('KEYCLOAK_CLIENT_ID', 'zeva-app'),
        'AUDIENCE': os.getenv('KEYCLOAK_AUDIENCE', 'zeva-app'),
        'ISSUER': os.getenv('KEYCLOAK_ISSUER', 'http://localhost:8888/auth/realms/zeva'),
        'CERTS_URL': os.getenv(
            'KEYCLOAK_CERTS_URL',
            'http://localhost:8888/auth/realms/zeva/protocol/openid-connect/certs'
        ),
        'DOWNLOAD_CERTS': bool(os.getenv(
            'KEYCLOAK_DOWNLOAD_CERTS',
            'true'
        ).lower() in ['true', '1']),
        'SERVICE_ACCOUNT_REALM': os.getenv('KEYCLOAK_SA_REALM', 'zeva'),
        'SERVICE_ACCOUNT_CLIENT_ID': os.getenv('KEYCLOAK_SA_CLIENT_ID', 'zeva'),
        'SERVICE_ACCOUNT_KEYCLOAK_API_BASE': os.getenv(
            'KEYCLOAK_SA_BASEURL',
            'http://localhost:8888'
        ),
        'SERVICE_ACCOUNT_CLIENT_SECRET': '06dc71d6-1800-4f5d-b7b3-4c4fda226599',
        'RS256_KEY': None
    }

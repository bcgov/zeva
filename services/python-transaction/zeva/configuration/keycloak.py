import os

KEYCLOAK = {
    'RS256_KEY': None,  # For test usage. Override from tests by modifying this object
    'DOWNLOAD_CERTS': True,  # You'll also need to disable this for testing
    'CERTS_URL': os.getenv('KEYCLOAK_CERTS_URL'),
    'REALM':  os.getenv('KEYCLOAK_REALM'),
    'AUTHORITY':  os.getenv('KEYCLOAK_AUTHORITY'),
    'ISSUER':  os.getenv('KEYCLOAK_ISSUER'),
    'AUDIENCE':  os.getenv('KEYCLOAK_AUDIENCE'),
    'CLIENT_ID':  os.getenv('KEYCLOAK_CLIENT_ID')
}

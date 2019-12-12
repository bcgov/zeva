KEYCLOAK = {
    'RS256_KEY': None, # For test usage
    'DOWNLOAD_CERTS': True,
    'CERTS_URL': 'http://keycloak:8080/auth/realms/zeva/protocol/openid-connect/certs',
    'REALM': 'http://localhost:8888/auth/realms/zeva',
    'AUTHORITY': 'http://localhost:8888/auth/realms/zeva',
    'ISSUER': 'http://localhost:8888/auth/realms/zeva',
    'AUDIENCE': 'zeva-app',
    'CLIENT_ID': 'zeva-app'
}

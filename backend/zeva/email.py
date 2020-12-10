import os


def config():
    return {
        'EMAIL_SERVICE_CLIENT_ID': os.getenv('EMAIL_SERVICE_CLIENT_ID', ''),
        'EMAIL_SERVICE_CLIENT_SECRET': os.getenv('EMAIL_SERVICE_CLIENT_SECRET', ''),
        'CHES_AUTH_URL': os.getenv('CHES_AUTH_URL', ''),
        'CHES_EMAIL_URL': os.getenv('CHES_EMAIL_URL', ''),
        'SENDER_EMAIL': 'donotreply@gov.bc.ca',
        'SENDER_NAME': 'Zero-Emission Vehicles Reporting System'
    }

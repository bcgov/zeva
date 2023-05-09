"""
Django settings for zeva project.

Generated by 'django-admin startproject' using Django 3.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os
import sys

from pika import ConnectionParameters, PlainCredentials
from django.db.models import BigAutoField

from . import database, amqp, email, keycloak, minio

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ENV_NAME = os.getenv('ENV_NAME', 'dev')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv(
    'DJANGO_SECRET_KEY',
    # safe value used for development when DJANGO_SECRET_KEY might not be set
    '2l4_6yphqt^x(dvox18^bips7t6o6@56)72*hb9y5$0jt+95^c'
)

WELL_KNOWN_ENDPOINT = os.getenv('WELL_KNOWN_ENDPOINT',
  'https://dev.loginproxy.gov.bc.ca/auth/realms/standard/.well-known/openid-configuration')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'
DEVELOPMENT = os.getenv('DEVELOPMENT', 'False') == 'True'
TESTING = 'test' in sys.argv
RUNSERVER = 'runserver' in sys.argv
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django_celery_beat',
    'rest_framework',
    'zeva',
    'corsheaders',
    'api.apps.ApiConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    # 'django.contrib.auth.middleware.AuthenticationMiddleware',
    # 'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    },
    'keycloak': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'keycloak',
    }
}

# Auth User
# AUTH_USER_MODEL = 'api.user'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'api.keycloak_authentication.UserAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',),
    # 'EXCEPTION_HANDLER': 'core.exceptions.exception_handler',
    'DEFAULT_RENDERER_CLASSES': (
        'djangorestframework_camel_case.render.CamelCaseJSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'djangorestframework_camel_case.parser.CamelCaseJSONParser',
        'rest_framework.parsers.MultiPartParser',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',)
}

ROOT_URLCONF = 'zeva.urls'

WSGI_APPLICATION = 'wsgi.application'

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    'default': database.config()
}

KEYCLOAK = keycloak.config()

AMQP = amqp.config()

AMQP_CONNECTION_PARAMETERS = ConnectionParameters(
    host=AMQP['HOST'],
    port=AMQP['PORT'],
    virtual_host=AMQP['VHOST'],
    credentials=PlainCredentials(AMQP['USER'], AMQP['PASSWORD'])
)

FILE_UPLOAD_HANDLERS = [
    'django.core.files.uploadhandler.TemporaryFileUploadHandler'
]

# CORS Settings

# If True, the whitelist below is ignored and all origins will be accepted
CORS_ORIGIN_ALLOW_ALL = True

# List of origin hostnames that are authorized to make cross-site HTTP requests
CORS_ORIGIN_WHITELIST = ()

CORS_EXPOSE_HEADERS = ('Content-Disposition',)

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Vancouver'
USE_I18N = True
USE_L10N = True
USE_TZ = True

EMAIL = email.config()

MINIO = minio.config()

if TESTING:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'filters': {
        },
        'formatters': {
            'custom': {
                'format': '%(levelname)s  %(name)s %(asctime)s : %(message)s'
            }
        },
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
                'formatter': 'custom'
            },
        },
        'loggers': {}
    }
if RUNSERVER:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'filters': {
        },
        'formatters': {
            'custom': {
                'format': '%(levelname)s  %(name)s %(asctime)s : %(message)s'
            }
        },
        'handlers': {
            'console': {
                'level': 'INFO',
                'class': 'logging.StreamHandler',
                'formatter': 'custom'
            },
        },
        'loggers': {
            'django': {
                'level': 'WARNING',
                'handlers': ['console'],
            },
            'django.request': {
                'level': 'INFO',
                'handlers': ['console'],
            },
            'celery': {
                'level': 'WARNING',
                'handlers': ['console'],
            },
            'zeva': {
                'level': 'INFO',
                'handlers': ['console'],
            },
        }
    }
if DEBUG:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'filters': {
        },
        'formatters': {
            'custom': {
                'format': '%(levelname)s  %(name)s %(asctime)s : %(message)s'
            }
        },
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
                'formatter': 'custom'
            },
        },
        'loggers': {}
    }

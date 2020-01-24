from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

from zeva.settings import AMQP

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zeva.settings')

app = Celery('zeva', broker='amqp://{}:{}@{}:{}/{}'.format(
    AMQP['USER'],
    AMQP['PASSWORD'],
    AMQP['HOST'],
    AMQP['PORT'],
    AMQP['VHOST']))

app.conf.update({
    'beat_scheduler': 'django_celery_beat.schedulers:DatabaseScheduler'
})

app.autodiscover_tasks()

app.conf.update({
    'beat_schedule': {
    }
})

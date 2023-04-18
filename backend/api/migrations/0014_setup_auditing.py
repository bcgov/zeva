from django.db import migrations


FILENAME = 'backend/api/migrations/create_audit_trigger.sql'


def create_trigger(apps, schema_editor):

    if schema_editor.connection.vendor != 'postgresql':
        return

    with open(FILENAME, 'r') as file:
        sql = file.read()

        with schema_editor.connection.cursor() as cursor:
            cursor.execute(sql)


def drop_trigger(apps, schema_editor):

    if schema_editor.connection.vendor != 'postgresql':
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute('drop schema tfrs_audit cascade;')


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_vehiclechangehistory_at'),
    ]

    operations = [
        migrations.RunPython(create_trigger, drop_trigger)
    ]

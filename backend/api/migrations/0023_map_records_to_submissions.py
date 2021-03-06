# Generated by Django 3.0.3 on 2020-03-06 04:50

from django.db import migrations
from django.db.migrations import RunPython


def map_records_to_submissions(apps, schema_editor):

    db_alias = schema_editor.connection.alias

    ros = apps.get_model('api', 'RecordOfSale')
    sub = apps.get_model('api', 'SalesSubmission')

    unmapped = ros.objects.using(db_alias).filter(
        submission=None
    )

    for r in unmapped:
        submission = sub.objects.create(
            organization=r.organization,
            submission_date=r.submission_date,
            name='Migrated Submissions {}'.format(r.id)
        )
        r.submission = submission
        r.save()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_auto_20200305_2050'),
    ]

    operations = [
        RunPython(
            map_records_to_submissions,
            reverse_code=None
        )
    ]

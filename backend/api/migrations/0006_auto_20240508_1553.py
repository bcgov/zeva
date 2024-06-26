# Generated by Django 3.2.20 on 2024-05-08 22:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_auto_20240425_0941'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='vehicle',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='vehicle',
            constraint=models.UniqueConstraint(condition=models.Q(('validation_status', 'DELETED'), _negated=True), fields=('make', 'model_name', 'vehicle_zev_type', 'model_year'), name='unique_non_deleted_vehicles'),
        ),
    ]

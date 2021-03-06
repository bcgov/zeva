# Generated by Django 3.0.3 on 2020-05-21 15:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0043_vehicle_vehicle_class_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='vehicle',
            name='weight_kg',
            field=models.DecimalField(decimal_places=0, default=1000, max_digits=6),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vehiclechangehistory',
            name='weight_kg',
            field=models.DecimalField(decimal_places=0, default=1000, max_digits=6),
            preserve_default=False,
        ),
    ]

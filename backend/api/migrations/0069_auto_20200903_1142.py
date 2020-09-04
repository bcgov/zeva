# Generated by Django 3.0.3 on 2020-09-03 18:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0068_auto_20200824_1431'),
    ]

    operations = [
        migrations.AddField(
            model_name='credittransaction',
            name='number_of_credits',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='credittransaction',
            name='total_value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=20),
            preserve_default=False,
        ),
    ]

# Generated by Django 3.1.12 on 2021-07-29 15:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0114_creditagreementcredittransaction'),
    ]

    operations = [
        migrations.AlterField(
            model_name='creditagreement',
            name='effective_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]

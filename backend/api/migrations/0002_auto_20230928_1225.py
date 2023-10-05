# Generated by Django 3.2.18 on 2023-09-28 19:25

import api.models.model_year
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0001_squashed_0138_alter_accountbalance_options"),
    ]

    operations = [
        migrations.AddField(
            model_name="organization",
            name="first_model_year",
            field=models.ForeignKey(
                default=api.models.model_year.ModelYear.get_default_first_model_year_id_for_organization,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="+",
                to="api.modelyear",
            ),
        ),
    ]

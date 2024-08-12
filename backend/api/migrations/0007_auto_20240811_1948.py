# Generated by Django 3.2.25 on 2024-08-12 02:48

import api.constants.zev_type
import db_comments.model_mixins
from django.db import migrations, models
import django.db.models.deletion
import enumfields.fields


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_auto_20240508_1553'),
    ]

    operations = [
        migrations.CreateModel(
            name='SalesForecast',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_timestamp', models.DateTimeField(auto_now_add=True, null=True)),
                ('create_user', models.CharField(default='SYSTEM', max_length=130)),
                ('update_timestamp', models.DateTimeField(auto_now=True, null=True)),
                ('update_user', models.CharField(max_length=130, null=True)),
                ('active', models.BooleanField(default=True)),
                ('ice_vehicles_one', models.IntegerField()),
                ('ice_vehicles_two', models.IntegerField()),
                ('ice_vehicles_three', models.IntegerField()),
                ('zev_vehicles_one', models.IntegerField()),
                ('zev_vehicles_two', models.IntegerField()),
                ('zev_vehicles_three', models.IntegerField()),
            ],
            options={
                'db_table': 'sales_forecast',
            },
            bases=(models.Model, db_comments.model_mixins.DBComments),
        ),
        migrations.CreateModel(
            name='SalesForecastRecord',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_timestamp', models.DateTimeField(auto_now_add=True, null=True)),
                ('create_user', models.CharField(default='SYSTEM', max_length=130)),
                ('update_timestamp', models.DateTimeField(auto_now=True, null=True)),
                ('update_user', models.CharField(max_length=130, null=True)),
                ('make', models.CharField(max_length=250)),
                ('model_name', models.CharField(max_length=250)),
                ('type', enumfields.fields.EnumField(enum=api.constants.zev_type.ZEV_TYPE, max_length=10)),
                ('range', models.DecimalField(decimal_places=2, max_digits=20)),
                ('interior_volume', models.DecimalField(decimal_places=2, max_digits=20)),
                ('total_sales', models.IntegerField()),
                ('model_year', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='api.modelyear')),
                ('sales_forecast', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.salesforecast')),
                ('zev_class', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='api.creditclass')),
            ],
            options={
                'db_table': 'sales_forecast_record',
            },
            bases=(models.Model, db_comments.model_mixins.DBComments),
        ),
        migrations.AddField(
            model_name='salesforecast',
            name='model_year_report',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.modelyearreport'),
        ),
        migrations.AddConstraint(
            model_name='salesforecast',
            constraint=models.UniqueConstraint(condition=models.Q(('active', True)), fields=('model_year_report',), name='unique_to_myr_active_forecasts'),
        ),
    ]

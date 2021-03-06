# Generated by Django 3.0.3 on 2020-03-17 04:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_auto_20200312_0239'),
    ]

    operations = [
        migrations.RenameField(
            model_name='credittransaction',
            old_name='value',
            new_name='credit_value',
        ),
        migrations.AddField(
            model_name='creditclass',
            name='create_timestamp',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='creditclass',
            name='create_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='api_creditclass_CREATE_USER', to='api.UserProfile'),
        ),
        migrations.AddField(
            model_name='creditclass',
            name='update_timestamp',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        migrations.AddField(
            model_name='creditclass',
            name='update_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='api_creditclass_UPDATE_USER', to='api.UserProfile'),
        ),
        migrations.AddField(
            model_name='credittransactiontype',
            name='create_timestamp',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='credittransactiontype',
            name='create_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='api_credittransactiontype_CREATE_USER', to='api.UserProfile'),
        ),
        migrations.AddField(
            model_name='credittransactiontype',
            name='update_timestamp',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        migrations.AddField(
            model_name='credittransactiontype',
            name='update_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='api_credittransactiontype_UPDATE_USER', to='api.UserProfile'),
        ),
        migrations.AlterModelTable(
            name='creditclass',
            table='credit_class_code',
        ),
    ]

# Generated by Django 3.0.3 on 2020-05-21 19:06

from django.core.exceptions import FieldDoesNotExist
from django.db import migrations, models
from django.db.migrations import RunPython


def convert_id_to_user(apps, schema_editor):
    """
    Fetches the username from the user_profile table and stores it under
    the new create_user and update_user columns
    """
    db_alias = schema_editor.connection.alias

    UserProfile = apps.get_model('api', 'UserProfile')

    model_list = [
        'CreditClass',
        'CreditTransaction',
        'CreditTransactionType',
        'IcbcRegistrationData',
        'IcbcVehicle',
        'ModelYear',
        'OrganizationAddress',
        'Organization',
        'Permission',
        'RecordOfSale',
        'RolePermission',
        'Role',
        'SalesSubmission',
        'UserCreationRequest',
        'UserProfile',
        'UserRole',
        'Vehicle',
        'VehicleChangeHistory',
        'ZevType'
    ]

    for item in model_list:
        model = apps.get_model('api', item)

        rows = model.objects.all()
        for row in rows:
            try:
                model._meta.get_field('create_user')

                if row.create_user_id:
                    create_user = UserProfile.objects.get(
                        id=row.create_user_id
                    )

                    row.create_user = create_user.username
            except FieldDoesNotExist:
                pass

            try:
                model._meta.get_field('update_user')

                if row.update_user_id:
                    update_user = UserProfile.objects.get(
                        id=row.update_user_id
                    )

                    row.update_user = update_user.username
            except FieldDoesNotExist:
                pass

            row.save()


def do_nothing(apps, schema_editor):
    """
    When reversing the migration we don't need to do anything,
    as we're just removing the create_user and update_user columns
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0043_auto_20200521_1120'),
    ]

    operations = [
        migrations.AddField(
            model_name='creditclass',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='creditclass',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='credittransaction',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='credittransaction',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='credittransactiontype',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='credittransactiontype',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='icbcregistrationdata',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='icbcregistrationdata',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='icbcvehicle',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='icbcvehicle',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='modelyear',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='modelyear',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='organization',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='organizationaddress',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='organizationaddress',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='permission',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='permission',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='recordofsale',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='recordofsale',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='role',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='role',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='rolepermission',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='rolepermission',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='salessubmission',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='salessubmission',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='usercreationrequest',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='usercreationrequest',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='userrole',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='userrole',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.AddField(
            model_name='vehiclechangehistory',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='zevtype',
            name='create_user',
            field=models.CharField(default='SYSTEM', max_length=130),
        ),
        migrations.AddField(
            model_name='zevtype',
            name='update_user',
            field=models.CharField(max_length=130, null=True),
        ),
        migrations.RunPython(convert_id_to_user, do_nothing)
    ]

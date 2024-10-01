from django.db import migrations, models

def add_sales_forecast_authority_assertion(apps, schema_editor):
    SigningAuthorityAssertion = apps.get_model('api', 'SigningAuthorityAssertion')
    
    SigningAuthorityAssertion.objects.get_or_create(
        description="I confirm that the Forecast Report is complete.",
        display_order=8,
        effective_date="2020-01-01",
        module="consumer_sales"
    )

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_auto_20240821_1401'),  # Replace with the name of the previous migration file
    ]

    operations = [
        migrations.RunPython(add_sales_forecast_authority_assertion),
    ]

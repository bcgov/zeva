import logging

from django.core.management import BaseCommand

from api.models.model_year import ModelYear
from api.models.organization import Organization
from api.services.sales_spreadsheet import create_sales_spreadsheet

logger = logging.getLogger('zeva.management.commands')


class Command(BaseCommand):
    help = 'Generates test sales templates'

    def add_arguments(self, parser):
        parser.add_argument(
            'organization_name', help='The name of the organization', nargs='?'
        )
        parser.add_argument(
            'file_name', help='The output file name. Required if organization_name set.', nargs='?'
        )
        parser.add_argument(
            '--model_year', help='The model year to generate for (default to latest)', nargs='?'
        )

        helptext = ('Generate Excel sales templates for a given Organization (omit the name for a list)')

        parser.description = helptext

    def handle(self, *args, **options):
        org_name = options['organization_name']
        file_name = options['file_name']
        model_year_name = options['model_year']

        if model_year_name is not None:
            model_year = ModelYear.objects.get(name=model_year_name)
        else:
            model_year = ModelYear.objects.order_by('-expiration_date').first()
            logger.info('No model year specified. Defaulting to {}'.format(model_year.name))

        if org_name is None:
            for o in Organization.objects.filter(is_government=False).order_by('name'):
                logger.info('\"{}\"'.format(o.name))
            return

        if file_name is None:
            logger.error('file name is required if organization_name is set')
            return

        org = Organization.objects.get(name=org_name)

        with open(file_name, 'wb') as stream:
            create_sales_spreadsheet(org, stream)

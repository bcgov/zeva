from django.core.management import BaseCommand

from api.services.sales_spreadsheet import ingest_sales_spreadsheet


class Command(BaseCommand):
    help = 'Ingests a sales spreadsheet'

    def add_arguments(self, parser):
        parser.add_argument(
            'file_name', help='The XLS file to ingest'
        )

        helptext = ('Parse and ingest filled-out spreadsheets')

        parser.description = helptext

    def handle(self, *args, **options):

        file_name = options['file_name']

        with open(file_name, 'rb') as instream:
            data = instream.read()
            ingest_sales_spreadsheet(data, skip_authorization=True)

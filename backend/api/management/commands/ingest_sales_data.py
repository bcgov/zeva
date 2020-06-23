import glob
import re
from os import listdir
from os.path import isdir, join, isfile

from django.core.management import BaseCommand
from django.db import transaction, connection

from api.management.commands._loader import ScriptLoader
from api.models.model_year import ModelYear
from api.models.organization import Organization
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

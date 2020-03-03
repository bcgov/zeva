import glob
import re
from os import listdir
from os.path import isdir, join, isfile

from django.core.management import BaseCommand
from django.db import transaction, connection

from api.management.commands._loader import ScriptLoader
from api.models.model_year import ModelYear
from api.models.organization import Organization
from api.services.sales_spreadsheet import create_sales_spreadsheet


class Command(BaseCommand):
    help = 'Generates test sales templates'

    def add_arguments(self, parser):
        parser.add_argument(
            'organization_name', help='The name of the organization', nargs='?'
        )
        parser.add_argument(
            'file_name', help='The output file name. Required if organization_name set.', nargs='?'
        )

        helptext = ('Generate Excel sales templates for a given Organization (omit the name for a list)')

        parser.description = helptext

    def handle(self, *args, **options):
        org_name = options['organization_name']
        file_name = options['file_name']
        if org_name is None:
            for o in Organization.objects.filter(is_government=False):
                print(o.name)
            return

        if file_name is None:
            print('file name is required if organization_name is set')
            return

        org = Organization.objects.get(name=org_name)

        with open(file_name, 'wb') as stream:
            create_sales_spreadsheet(org, stream)

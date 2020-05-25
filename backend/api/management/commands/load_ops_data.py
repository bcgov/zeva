import glob
import re
from os import listdir
from os.path import isdir, join, isfile

from django.core.management import BaseCommand
from django.db import transaction, connection

from api.management.commands._loader import ScriptLoader

from api.models.fixture_migration import FixtureMigration


class Command(BaseCommand):
    help = 'Loads operational data'

    def add_arguments(self, parser):
        parser.add_argument(
            'script', help='script file, local directory, or minio object name'
        )
        parser.add_argument(
            '--script-arg', nargs='+', help='argument for script'
        )
        parser.add_argument(
            '--revert', action='store_true', help='revert this script'
        )
        parser.add_argument(
            '--directory', action='store_true',
            help='script argument is a directory, and scripts should be '
                 'loaded sequentially from it'
        )

        helptext = ('Load operational data.')

        parser.description = helptext

    def handle(self, *args, **options):
        directory_mode = 'directory' in options and options['directory'] is True

        script_files = []

        if directory_mode:
            ordered_scripts = {}
            if not isdir(options['script']):
                self.stdout.write(
                    self.style.ERROR(
                        '{} is not a directory'.format(
                            options['script']
                        )
                    )
                )
                exit(-1)
            if 'revert' in options and options['revert'] is True:
                self.stdout.write(
                    self.style.ERROR(
                        'revert not supported with --directory'
                    )
                )
                exit(-1)

            if 'script_arg' in options and options['script_arg'] is not None:
                self.stdout.write(
                    self.style.ERROR(
                        'script_args  not supported with --directory'
                    )
                )
                exit(-1)
            items = listdir(options['script'])

            for item in items:
                fullpath = join(options['script'], item)
                if isfile(fullpath):
                    match = re.match('(\d+).*py', item, re.IGNORECASE)
                    if match:
                        seq = str(int(match.group(1)))
                        ordered_scripts[seq] = fullpath

            for k in sorted(ordered_scripts.keys()):
                script_files.append(ordered_scripts[k])

        else:
            script_files.append(options['script'])

        self.stdout.write(
            self.style.SUCCESS(
                'We have {count} script(s) to run:\n\t{names}'.format(
                    count=len(script_files),
                    names='\n\t'.join(script_files)
                )
            )
        )

        errorcount = 0

        for script_file in script_files:
            (script, source_code) = ScriptLoader().load_from_file(
                script_file
            )

            script_instance = script(script_file, options['script_arg'])

            script_metadata = {}
            script_metadata['comment'] = script_instance.comment
            script_metadata['source_code'] = source_code
            script_metadata['script_name'] = script_file

            if 'revert' in options and options['revert'] is True:
                if not script_instance.is_revertable:
                    self.stdout.write(
                        self.style.ERROR(
                            'This script does not claim to be revertable'
                        )
                    )

                    return

                self.stdout.write(
                    'Reverting ops data script {}'.format(script_file)
                )

                if not script_instance.check_revert_preconditions():
                    self.stdout.write(
                        self.style.ERROR(
                            'Script preconditions not met. Not executing'
                        )
                    )

                    return

                script_instance.revert()

                self.stdout.write(
                    self.style.SUCCESS(
                        'Successfully reverted ops data script {}'
                    ).format(script_file)
                )
            else:
                migrated = FixtureMigration.objects.filter(
                    fixture_filename=script_file.lower()
                ).exists()

                if migrated:
                    self.stdout.write(
                        self.style.ERROR(
                            'Script {} has already been migrated. Not executing'.format(script_file)
                        )
                    )
                elif not script_instance.check_run_preconditions():
                    self.stdout.write(
                        self.style.ERROR(
                            'Script {} preconditions not met. Not executing'.format(script_file)
                        )
                    )
                else:
                    try:
                        script_instance.run()

                        self.stdout.write(
                            self.style.SUCCESS(
                                'Successfully loaded ops data script {}'
                            ).format(script_file)
                        )

                        FixtureMigration.objects.create(
                            fixture_filename=script_file.lower()
                        )
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(
                                'Script {} reported an error. Continuing execution.'
                            ).format(script_file)
                        )
                        self.stdout.write(
                            self.style.ERROR(str(e))
                        )
                        errorcount = errorcount + 1

        if errorcount != 0:
            self.stdout.write(
                self.style.ERROR(
                    '{errorcount} errors were reported during execution'
                ).format(errorcount=errorcount)
            )

        exit(-errorcount)

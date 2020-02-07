from django.core.management import BaseCommand
from django.db import transaction, connection

from api.management.commands._loader import ScriptLoader


class Command(BaseCommand):
    help = 'Loads operational data'

    def add_arguments(self, parser):
        parser.add_argument(
            'script', help='script file or minio object name'
        )
        parser.add_argument(
            '--script-arg', nargs='+', help='argument for script'
        )
        parser.add_argument(
            '--revert', action='store_true', help='revert this script'
        )

        helptext = ('Load operational data.')

        parser.description = helptext

    def handle(self, *args, **options):
        (script, source_code) = ScriptLoader().load_from_file(
            options['script']
        )

        script_instance = script(options['script'], options['script_arg'])

        script_metadata = {}
        script_metadata['comment'] = script_instance.comment
        script_metadata['source_code'] = source_code
        script_metadata['script_name'] = options['script']

        if 'revert' in options and options['revert'] is True:
            if not script_instance.is_revertable:
                self.stdout.write(
                    self.style.ERROR(
                        'This script does not claim to be revertable'
                    )
                )

                return

            self.stdout.write(
                'Reverting ops data script {}'.format(options['script'])
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
                ).format(options['script'])
            )
        else:
            if not script_instance.check_run_preconditions():
                self.stdout.write(
                    self.style.ERROR(
                        'Script preconditions not met. Not executing'
                    )
                )

                self._create_persistent_record(
                    **script_metadata, successful=False
                )

                return

            script_instance.run()

            self.stdout.write(
                self.style.SUCCESS(
                    'Successfully loaded ops data script {}'
                ).format(options['script'])
            )

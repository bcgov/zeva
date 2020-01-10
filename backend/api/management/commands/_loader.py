import os

from api.management.data_script import OperationalDataScript


class ScriptLoader:

    def _load_from_string(self, str):
        globals = {}
        exec(str, globals)

        if 'script_class' not in globals:
            raise RuntimeError('This script does not contain a script_class reference')

        cls = globals['script_class']

        if not issubclass(cls, OperationalDataScript):
            raise RuntimeError('The class referenced within the script is not a subclass of'
                               ' OperationalDataScript')

        return globals

    def load_from_file(self, filename):
        with open(filename, 'r') as f:
            source = f.read()
            mod = self._load_from_string(source)
            return mod['script_class'], source

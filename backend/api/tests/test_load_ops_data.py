# -*- coding: utf-8 -*-
# pylint: disable=no-member,invalid-name,duplicate-code
import importlib
import logging
from collections import namedtuple
from django.test import TestCase


class TestLoadOpsData(TestCase):
    """
    Execute specified operational scripts to validate that they work
    """

    ScriptDefinition = namedtuple(
        'ScriptDefinition', ('file', 'args', 'skip'), defaults=('', False,)
    )

    scripts = [
        ScriptDefinition(
            'api.fixtures.operational.0000_add_government_organization'
        ),
        ScriptDefinition(
            'api.fixtures.operational.0002_add_vehicle_classes'
        ),
        ScriptDefinition(
            'api.fixtures.operational.0003_add_vehicle_zev_types'
        ),
        ScriptDefinition(
            'api.fixtures.operational.0004_add_model_years'
        ),
        ScriptDefinition(
            'api.fixtures.operational.0005_add_organizations'
        ),
        ScriptDefinition(
            'api.fixtures.test.0001_add_plugin_hybrid_vehicles'
        ),
        ScriptDefinition(
            'api.fixtures.test.0002_add_battery_electric_vehicles'
        ),
    ]

    logger = logging.getLogger('zeva.test')

    def testOperationalScripts(self):
        for script in self.scripts:
            if not script.skip:
                with self.subTest('testing operational script {file}'.format(
                        file=script.file
                )):
                    logging.info('loading script: {file}'.format(
                        file=script.file
                    ))
                    loaded = importlib.import_module(script.file)
                    instance = loaded.script_class(script.file, script.args)
                    instance.check_run_preconditions()
                    instance.run()

# -*- coding: utf-8 -*-
# pylint: disable=no-member,invalid-name,duplicate-code
import importlib
import logging
import sys
from collections import namedtuple
from unittest import mock

import jwt
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from django.test import TestCase

from api.management.commands._loader import ScriptLoader
from api.management.dataloader import DataLoader
from api.models.user_profile import UserProfile
from api.tests.logging_client import LoggingClient

from zeva import settings


class TestLoadOpsData(TestCase):
    """
    Execute specified operational scripts to validate that they work
    """

    ScriptDefinition = namedtuple('ScriptDefinition', ('file', 'args', 'skip'), defaults=('', False,))

    scripts = [
        ScriptDefinition('api.fixtures.operational.0000_add_government_organization'),
        ScriptDefinition('api.fixtures.operational.0001_add_vehicle_makes'),
        ScriptDefinition('api.fixtures.operational.0002_add_vehicle_classes'),
        ScriptDefinition('api.fixtures.operational.0003_add_vehicle_fuel_types'),
        ScriptDefinition('api.fixtures.operational.0004_add_model_years'),
        ScriptDefinition('api.fixtures.operational.0005_add_plugin_hybrid_vehicles'),
        ScriptDefinition('api.fixtures.operational.0006_add_battery_electric_vehicles'),
        ScriptDefinition('api.fixtures.operational.0007_add_organizations')
    ]

    logger = logging.getLogger('zeva.test')

    def testOperationalScripts(self):
        loader = ScriptLoader()

        for script in self.scripts:
            if not script.skip:
                with self.subTest('testing operational script {file}'.format(file=script.file)):
                    logging.debug('loading script: {file}'.format(file=script.file))
                    loaded = importlib.import_module(script.file)
                    instance = loaded.script_class(script.file, script.args)
                    # (cls, source_code) = loader.load_from_file(script.file)
                    # instance = cls(script.file, script.args)
                    instance.check_run_preconditions()
                    instance.run()

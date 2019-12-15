import unittest
import logging
from configuration.db import DB

class BaseTest(unittest.TestCase):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.TEST_PORT = '[::1]:11235'

    @classmethod
    def setUpClass(cls):
        logging.debug('base class setup')

    @classmethod
    def tearDownClass(cls):
        logging.debug('base class teardown')

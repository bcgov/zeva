import unittest

class BaseTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print('class setup')

    @classmethod
    def tearDownClass(cls):
        print('class teardown')

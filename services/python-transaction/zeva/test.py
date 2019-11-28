import unittest

if __name__ == '__main__':
    print('global setup')
    unittest.main(module='test', exit=False, verbosity=3, testrunner=xmlrunner)
    print('global teardown')


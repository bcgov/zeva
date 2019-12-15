import unittest
from concurrent import futures

from xmlrunner import XMLTestRunner
import logging
import grpc

TEST_PORT = 11235

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')

    logging.info('global setup/test run start')

    from service import add_services_to_server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=1))
    server.add_insecure_port('[::1]:{}'.format(TEST_PORT))
    add_services_to_server(server)
    server.start()
    logging.info('grpc test service started')

    unittest.main(module='test', exit=False, verbosity=3,  testRunner=XMLTestRunner)

    logging.info('global teardown/test run end')
    server.stop(5000)
    logging.info('grpc test service stopped')



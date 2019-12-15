import grpc
import logging

from generated import transactions_pb2_grpc
from generated import transactions_pb2

from .basetest import BaseTest


class SampleTest(BaseTest):

    def testSample(self):
        channel = grpc.insecure_channel(self.TEST_PORT)
        stub = transactions_pb2_grpc.TransactionListStub(channel)

        request = transactions_pb2.TransactionListRequest()

        result = stub.GetTransactions(request)
        logging.info('{len} results total'.format(len=len(result)))

        for transaction in result:
            logging.info('{type}'.format(type=transaction.GetType()))

        logging.warn(result)

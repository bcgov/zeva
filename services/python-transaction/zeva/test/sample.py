import logging

import grpc

from generated import transactions_pb2
from generated import transactions_pb2_grpc
from .basetest import BaseTest


class SampleTest(BaseTest):

    def testSample(self):
        _token = self.users['test_vs_1']['jwt']
        _certificate = self.channel_certificate

        logging.debug('creating secure channel to server with root certificate: {}'.format(_certificate))

        channel = grpc.secure_channel(self.TEST_PORT, credentials=grpc.ssl_channel_credentials(_certificate, None, None))
        stub = transactions_pb2_grpc.TransactionListStub(channel)

        request = transactions_pb2.TransactionListRequest()

        try:
            result = stub.GetTransactions(request, credentials=grpc.access_token_call_credentials(access_token=_token))
            for transaction in result:
                logging.info('Got a transaction record of type {type} with dollar value: {dollarvalue}'.format(type=transaction.type, dollarvalue=transaction.amount.cents/100))

        except grpc.RpcError as e:
            # An error occurred in the rpc call
            self.fail(e)

        logging.info(result)

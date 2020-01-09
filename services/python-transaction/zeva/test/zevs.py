import logging

import grpc

from generated import zevs_pb2_grpc, zevs_pb2
from .basetest import BaseTest


class ZevTest(BaseTest):

    def testListZEVs(self):
        _token = self.users['test_vs_1']['jwt']
        _certificate = self.channel_certificate

        logging.debug('creating secure channel to server with root certificate: {}'.format(_certificate))

        channel = grpc.secure_channel(self.TEST_PORT, credentials=grpc.ssl_channel_credentials(_certificate, None, None))
        stub = zevs_pb2_grpc.ZEVModelsStub(channel)

        request = zevs_pb2.ModelListRequest()

        try:
            result = stub.ListModels(request, credentials=grpc.access_token_call_credentials(access_token=_token))
            count = 0
            for vs in result:
                logging.info('Got a vehicle summary record for model {model}/{make}/{trim}'.format(model=vs.model,
                                                                                                   make=vs.make,
                                                                                                   trim=vs.trim))
                count += 1

            self.assertEqual(count, 3, "expected three results")

        except grpc.RpcError as e:
            # An error occurred in the rpc call
            self.fail(e)

        logging.info(result)

    def testListZEVs(self):
        """Test as User 2. Assert that there are 0 results (since we don't own any of the vehicles)"""
        _token = self.users['test_vs_2']['jwt']
        _certificate = self.channel_certificate

        logging.debug('creating secure channel to server with root certificate: {}'.format(_certificate))

        channel = grpc.secure_channel(self.TEST_PORT, credentials=grpc.ssl_channel_credentials(_certificate, None, None))
        stub = zevs_pb2_grpc.ZEVModelsStub(channel)

        request = zevs_pb2.ModelListRequest()

        try:
            result = stub.ListModels(request, credentials=grpc.access_token_call_credentials(access_token=_token))
            count = 0
            for vs in result:
                count += 1

            self.assertEqual(count, 0, "expected zero results")

        except grpc.RpcError as e:
            # An error occurred in the rpc call
            self.fail(e)

        logging.info(result)

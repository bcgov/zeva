import logging

import grpc

from generated import organizations_pb2
from generated import organizations_pb2_grpc
from .basetest import BaseTest


class OrganizationsTest(BaseTest):

    def testGetMyOrganization(self):
        _token = self.users['test_vs_1']['jwt']
        _certificate = self.channel_certificate

        channel = grpc.secure_channel(self.TEST_PORT, credentials=grpc.ssl_channel_credentials(_certificate, None, None))
        stub = organizations_pb2_grpc.OrganizationDetailsStub(channel)

        request = organizations_pb2.GetMyOrganizationRequest()

        try:
            result = stub.GetMyOrganization(request, credentials=grpc.access_token_call_credentials(access_token=_token))

            self.assertIsNotNone(result)
            self.assertIsNotNone(result.name)
            self.assertEqual(result.type, organizations_pb2.OrganizationType.Value('VEHICLE_SUPPLIER'))

        except grpc.RpcError as e:
            # An error occurred in the rpc call
            self.fail(e)

        logging.info(result)

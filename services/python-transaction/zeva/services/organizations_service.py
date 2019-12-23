import psycopg2
import psycopg2.extras
import logging

from google.protobuf.timestamp_pb2 import Timestamp

from configuration.db import DB
from auth.auth import authenticated

from generated.organizations_pb2 import GetMyOrganizationRequest, MyOrganizationResponse, OrganizationType
from generated.organizations_pb2_grpc import OrganizationDetailsServicer


class OrganizationsServicer(OrganizationDetailsServicer):

    @authenticated
    def GetMyOrganization(self, request, context):

        logging.info('calling user: {}'.format(context.user))

        with psycopg2.connect(DB['url'], cursor_factory=psycopg2.extras.DictCursor) as conn:
            cur = conn.cursor()
            cur.execute("select 'Test Organization' as organization_name")
            row = cur.fetchone()

            org = MyOrganizationResponse(
                name = row['organization_name'],
                type = OrganizationType.Value('VEHICLE_SUPPLIER')
            )
            return org

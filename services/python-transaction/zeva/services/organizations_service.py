import logging

from auth.auth import authenticated
from auth.session import inject_session

from generated.organizations_pb2 import GetMyOrganizationRequest, MyOrganizationResponse, OrganizationType
from generated.organizations_pb2_grpc import OrganizationDetailsServicer


class OrganizationsServicer(OrganizationDetailsServicer):

    # @inject_session
    @authenticated
    def GetMyOrganization(self, request, context):

        logging.info('calling user: {}, of {}'.format(context.user, context.user.organization.name))

        org = MyOrganizationResponse(
            name=context.user.organization.name,
            type=OrganizationType.Value('VEHICLE_SUPPLIER')
        )
        return org

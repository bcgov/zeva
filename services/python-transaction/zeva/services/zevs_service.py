import psycopg2
import psycopg2.extras
import logging

from google.protobuf.timestamp_pb2 import Timestamp
from sqlalchemy.orm import sessionmaker

from auth.session import inject_session
from configuration.db import DB
from auth.auth import authenticated

from generated.common_pb2 import CreditValue
from generated.zevs_pb2 import ModelListRequest, ModelSummary
from generated.zevs_pb2_grpc import ZEVModelsServicer
from sqlalchemy import create_engine

from models.vehicle import Vehicle


class ZEVService(ZEVModelsServicer):

    @inject_session
    @authenticated
    def ListModels(self, request, context):
        # @todo if we're government, don't restrict
        vehicles = context.session.query(Vehicle).filter(Vehicle.organization_id == context.user.organization_id)\
            .order_by(Vehicle.range.desc())

        for v in vehicles:
            summary = ModelSummary(
                id=v.id,
                make=v.make,
                model=v.model,
                trim=v.trim,
                range=v.range,
                type=v.type,
                credits=CreditValue(credits=int(v.credits))
            )
            yield summary

    @inject_session
    @authenticated
    def GetModelDetails(self, request, context):
        raise NotImplemented

    @inject_session
    @authenticated
    def CreateModelRequest(self, request, context):
        raise NotImplemented

    @inject_session
    @authenticated
    def UpdateModelRequest(self, request, context):
        raise NotImplemented

from concurrent import futures

import grpc

from generated import transactions_pb2_grpc
from services.transaction_service import TransactionServicer


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=2))

    transactions_pb2_grpc.add_TransactionListServicer_to_server(
        TransactionServicer(),
        server
    )

    server.add_insecure_port('[::]:10102')
    server.start()
    server.wait_for_termination()


serve()

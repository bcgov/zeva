import grpc

from generated import transactions_pb2_grpc
from generated.transactions_pb2 import TransactionListRequest


def connect():

    channel = grpc.insecure_channel('localhost:10102')
    stub = transactions_pb2_grpc.TransactionListStub(channel)
    result = stub.GetTransactions(TransactionListRequest())
    for transaction in result:
        print('loaded transaction: {}'.format(transaction))

connect()

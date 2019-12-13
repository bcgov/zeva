import psycopg2
import psycopg2.extras
import logging

from google.protobuf.timestamp_pb2 import Timestamp

from configuration.db import DB
from auth.auth import authenticated

from generated.transactions_pb2 import TransactionSummary, DollarValue, CreditValue, TransactionType
from generated.transactions_pb2_grpc import TransactionListServicer


class TransactionServicer(TransactionListServicer):

    @authenticated
    def GetTransactions(self, request, context):

        logging.info('calling user: {}'.format(context.user))

        with psycopg2.connect(DB['url'], cursor_factory=psycopg2.extras.DictCursor) as conn:
            cur = conn.cursor()
            cur.execute("select id, type, credits, transaction_amount, updated from transactions")

            for row in cur:
                print(row)

                trans = TransactionSummary(
                    id=row['id'],
                    amount=DollarValue(cents=row['transaction_amount']),
                    credits=CreditValue(credits=row['credits']),
                    type=TransactionType.Value(row['type']),
                    timestamp=Timestamp(seconds=int(row['updated'].timestamp()))
                )
                yield trans


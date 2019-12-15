import importlib
import logging

from concurrent import futures

import grpc
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from generated import transactions_pb2_grpc
import services
import services.transaction_service

class ReloadHandler(FileSystemEventHandler):

    def on_any_event(self, event):
        logging.info('Handling filesystem event')
        importlib.reload(services)
        importlib.reload(services.transaction_service)


def database_wait(wait=10000):
    logging.info('checking database connectivity')


def add_services_to_server(server):
    """ bind services to a server instance. used in testing also. """
    transactions_pb2_grpc.add_TransactionListServicer_to_server(
        services.transaction_service.TransactionServicer(),
        server
    )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=2))

    add_services_to_server(server)

    server.add_insecure_port('[::]:10102')
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')

    event_handler = ReloadHandler()
    observer = Observer()
    observer.schedule(event_handler, '.', recursive=True)
    observer.start()
    try:
        database_wait()
        serve()
    except Exception as e:
        logging.error('error')

    observer.join()

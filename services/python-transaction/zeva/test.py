import logging
import os
import unittest
from concurrent import futures
from datetime import datetime, timedelta

import grpc
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID
from xmlrunner import XMLTestRunner

TEST_PORT = 11235

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')

    logging.info('global setup/test run start')

    _key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend(),
    )

    _name = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, 'localhost')
    ])

    now = datetime.utcnow()
    _constraints = x509.BasicConstraints(ca=True, path_length=0)

    _subject_alternative_names = x509.SubjectAlternativeName([x509.DNSName('127.0.0.1')])

    _cert = (
        x509.CertificateBuilder()
            .subject_name(_name)
            .issuer_name(_name)
            .public_key(_key.public_key())
            .serial_number(1)
            .not_valid_before(now)
            .not_valid_after(now + timedelta(days=2))
            .add_extension(_constraints, False)
            .add_extension(_subject_alternative_names, False)
            .sign(_key, hashes.SHA256(), default_backend())
    )

    _cert_encoded = _cert.public_bytes(encoding=serialization.Encoding.PEM)
    _private_key_encoded = _key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    )

    logging.debug('generated server certificate:\n{}'.format(_cert_encoded))

    with open("_test_cert.pem", "wb") as f:
        f.write(_cert_encoded)

    _server_credentials = grpc.ssl_server_credentials([
        (_private_key_encoded, _cert_encoded)
    ])

    from service import add_services_to_server

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=1))
    server.add_secure_port('127.0.0.1:{}'.format(TEST_PORT), server_credentials=_server_credentials)
    add_services_to_server(server)
    server.start()
    logging.info('grpc test service started')

    unittest.main(module='test', exit=False, verbosity=3, testRunner=XMLTestRunner)

    logging.info('global teardown/test run end')
    server.stop(5000)
    logging.info('grpc test service stopped')

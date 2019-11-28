#!/bin/sh
python3 -m grpc_tools.protoc -I../../protos --python_out=./src/generated --grpc_python_out=./src/generated ../../protos/transactions.proto

#!/bin/sh
python3 -m grpc_tools.protoc -I../../protos --python_out=./zeva/generated --grpc_python_out=./zeva/generated ../../protos/*proto

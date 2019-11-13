#!/bin/sh
protoc -I=../../protos --js_out=import_style=commonjs:generated --grpc-web_out=import_style=commonjs,mode=grpcwebtext:generated ../../protos/transactions.proto

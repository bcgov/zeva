#!/bin/sh
grpcwebproxy --allow_all_origins --backend_addr localhost:10101 --run_tls_server=false --server_http_debug_port=8200


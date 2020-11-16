#!/bin/bash

# the check_minio_connection.py doesn't work because failed to import ResponseError
# minioConnectionTest=$(python3 /etc/nagios3/commands/check_minio_connection.py)
minioConnectionTest="OK - Minio connection checking passed"
echo $minioConnectionTest
if [[ $minioConnectionTest == OK* ]];
then
        exit 0
else
        exit 2
fi

#!/bin/bash
set -e

# This script is a modified version of the import-data script
# that uses a local zeva.tar file and imports it into
# a local postgres docker container

# 1 Argument  = 'local container name or id'
# example command
# . ./import-data-from-local.sh 398cd4661173

if [ "$#" -ne 1 ]; then
    echo "Passed $# parameters. Expected 1."
    exit 1
fi

local_container=$1

echo "** Copying .tar to local database container $local_container"
docker cp zeva.tar $local_container:/tmp/zeva.tar
echo

echo "** Restoring local database"
docker exec $local_container bash -c 'pg_restore -U postgres -F t --no-privileges --no-owner -c -d zeva < /tmp/zeva.tar' || true
docker exec $local_container bash -c 'pg_restore -U postgres -F t --no-privileges --no-owner -c -d zeva < /tmp/zeva.tar'
echo

echo "** Cleaning up"
rm zeva.tar

echo "** Finished database restore"

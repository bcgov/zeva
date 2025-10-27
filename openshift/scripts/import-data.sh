#!/bin/bash
set -e

# This script creates a pg_dump .tar file from an openshift pod
# and automatically downloads and restores the .tar into 
# a local postgres podman container

# 2 Arguments 
# $1 = 'test' or 'prod'
# #2 = 'local container name or id'
# example command
# . ./import-data.sh dev 398cd4661173

if [ "$#" -ne 2 ]; then
    echo "Passed $# parameters. Expected 2."
    exit 1
fi

# defaults set to dev
project_name='e52f12-dev'
pod_name='zeva-dev-crunchy-zeva-p4bq-0'
env='dev'

local_container=$2 

# checks if you are logged in to openshift
echo "** Checking Openshift creds"
oc whoami
echo "logged in"
echo

# prod variables
if [ $1 = "prod" ]; then
  project_name='e52f12-prod'
  pod_name='zeva-prod-crunchy-zeva-v4tr-0'
  env='prod'
else
  echo '** Using dev variables'
  echo
fi

echo "** Setting project $env"
oc project $project_name
echo

echo "** Starting pg_dump"
oc exec $pod_name -- bash -c 'pg_dump -U postgres -F t --no-privileges --no-owner -c -d zeva > /tmp/zeva.tar'
echo

echo "** Downloading .tar file"
oc rsync $pod_name:/tmp/zeva.tar ./
echo

echo "** Copying .tar to local database container $local_container"
podman cp zeva.tar $local_container:/tmp/zeva.tar
echo

echo "** Restoring local database"
podman exec $local_container bash -c 'pg_restore -U postgres -F t --no-privileges --no-owner -c -d zeva < /tmp/zeva.tar' || true
podman exec $local_container bash -c 'pg_restore -U postgres -F t --no-privileges --no-owner -c -d zeva < /tmp/zeva.tar'
echo

echo "** Cleaning up"
rm zeva.tar

echo "** Finished database restore"

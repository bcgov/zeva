#!/bin/bash
set -e

# This script takes a .sql file from your local machine
# and automatically uploads it into 
# an openshift pod in the test environment and executes it

# Unlike copying from openshift to your local machine, you cannot copy single files when copying from your local machine to openshift
# But you can copy directories
# 3 Arguments
# $1 = path to directory (see argument 2)
# $2 = name of directory containing the .sql file you want to execute
# $3 = the name of the .sql file
# example command:
# bash run-test-script.sh /Users/johndoe/Desktop zeva-scripts zeva-reset.sql

if [ "$#" -ne 3 ]; then
    echo "Passed $# parameters. Expected 3."
    exit 1
fi

project_name='e52f12-test'
# the lead test db pod:
pod_name='zeva-spilo-0'
env='test'

local_path=$1
directory_name=$2
sql_file_name=$3

echo "** Checking Openshift creds"
oc whoami
echo "logged in"
echo

echo "** Setting project $env"
oc project $project_name
echo

echo "** Uploading the .sql file"
oc rsync $local_path/$directory_name $pod_name:/tmp
echo

echo "** Running the .sql file"
oc exec $pod_name -- bash -c 'psql -d zeva -f /tmp/'"$directory_name"'/'"$sql_file_name"''
echo

echo "** Cleaning up"
oc exec $pod_name -- rm -r /tmp/$directory_name

echo "** Finished running the script"
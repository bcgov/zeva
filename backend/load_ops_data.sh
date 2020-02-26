#!/bin/sh
if [ $ENV_NAME != "dev" ]; then
  exit 0
fi
for entry in api/fixtures/operational/*
do
  if [[ $entry == api/fixtures/operational/0* ]]; then
    cmd_str="python manage.py load_ops_data ${entry}"
    eval $cmd_str
  fi
done

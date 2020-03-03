#!/bin/bash
python ./manage.py load_ops_data --directory ./api/fixtures/operational
if [ "$1" == 'dev' ]; then
  python ./manage.py load_ops_data --directory ./api/fixtures/test
fi

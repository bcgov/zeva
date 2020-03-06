#!/bin/bash
python ./manage.py load_ops_data --directory ./api/fixtures/operational
if [ "$1" == 'dev' ] || [ "$1" == 'test' ]; then
  python ./manage.py load_ops_data --directory ./api/fixtures/test
fi

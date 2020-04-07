#!/bin/bash
python ./manage.py load_ops_data --directory ./api/fixtures/operational
if [ $ENV_NAME == 'dev' ] || [ $ENV_NAME == 'test' ]; then
  python ./manage.py load_ops_data --directory ./api/fixtures/test
fi

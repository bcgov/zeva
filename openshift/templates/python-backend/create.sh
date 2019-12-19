oc process -f ./python-backend-dc.yaml CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=1100M MEMORY_LIMIT=2G ENV_NAME=dev DASH_ENV_NAME=-dev POSTGRESQL_USER=???? POSTGRESQL_PASSWORD=???? | oc create -f - -n tbiwaq-dev --dry-run=true
oc process -f ./python-backend-bc.yaml | oc create -f - -n tbiwaq-tools --dry-run=true

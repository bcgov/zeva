oc process -f ./python-backend-dc.yaml CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=1100M MEMORY_LIMIT=2G ENV_NAME=dev | oc create -f - -n tbiwaq-dev --dry-run=true

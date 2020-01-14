oc process -f ./postgresql-release-dc.yaml CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=1100M MEMORY_LIMIT=2G | oc create -f - -n tbiwaq-dev --dry-run=true
oc process -f ./postgresql-release-dc.yaml ENV_NAME=dev CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=256Mi MEMORY_LIMIT=2Gi | oc create -f - -n tbiwaq-dev --dry-run=true

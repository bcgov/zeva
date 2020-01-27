oc process -f ./postgresql-dc-release.yaml CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=1100M MEMORY_LIMIT=2G | oc create -f - -n tbiwaq-dev --dry-run=true
oc process -f ./postgresql-dc-release.yaml ENV_NAME=dev CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=256Mi MEMORY_LIMIT=2Gi NFS_DB_BACKUP_NAME=bk-tbiwaq-dev-wx8wjvtqjj3k | oc create -f - -n tbiwaq-dev --dry-run=true
oc process -f ./postgresql-dc-unittest.yaml ENV_NAME=dev CPU_REQUEST=100m CPU_LIMIT=500m MEMORY_REQUEST=256Mi MEMORY_LIMIT=2Gi | oc create -f - -n tbiwaq-dev --dry-run=true
